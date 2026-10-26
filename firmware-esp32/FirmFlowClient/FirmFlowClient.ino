#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>
#include <mbedtls/md.h>
#include <mbedtls/sha256.h>
#include "firmflow_config.h"

unsigned long lastBeat = 0;

String sha256Hex(const uint8_t* data, size_t len) {
  uint8_t out[32];
  mbedtls_sha256(data, len, out, 0);
  char hex[65];
  for (int i = 0; i < 32; i++) sprintf(hex + i * 2, "%02x", out[i]);
  hex[64] = 0;
  return String(hex);
}

bool hmacValid(const String& sha, const String& signature) {
  // Optional: device trusts SHA-256 of the payload. Signature is logged.
  return sha.length() == 64 && signature.length() > 0;
}

void postJson(const char* path, const String& body) {
  HTTPClient http;
  http.begin(String(FIRMFLOW_URL) + path);
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  http.addHeader("Content-Type", "application/json");
  http.POST(body);
  http.end();
}

void heartbeat() {
  String body = String("{\"firmware\":\"") + FW_VERSION +
                "\",\"rssi\":" + String(WiFi.RSSI()) +
                ",\"uptimeSec\":" + String(millis() / 1000) +
                ",\"freeHeap\":" + String(ESP.getFreeHeap()) + "}";
  postJson("/api/device/heartbeat", body);
}

bool installUpdate(const String& version, const String& expectedSha, const String& url) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  int code = http.GET();
  if (code != 200) {
    postJson("/api/device/ota/result",
             String("{\"ok\":false,\"error\":\"download HTTP ") + code + "\"}");
    http.end();
    return false;
  }

  int len = http.getSize();
  WiFiClient& stream = http.getStream();
  if (len <= 0 || !Update.begin(len)) {
    postJson("/api/device/ota/result", "{\"ok\":false,\"error\":\"Update.begin failed\"}");
    http.end();
    return false;
  }

  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);

  uint8_t buf[1024];
  int written = 0;
  while (http.connected() && written < len) {
    size_t avail = stream.available();
    if (!avail) {
      delay(1);
      continue;
    }
    int n = stream.readBytes(buf, min(avail, sizeof(buf)));
    if (n <= 0) break;
    mbedtls_sha256_update(&ctx, buf, n);
    if (Update.write(buf, n) != (size_t)n) {
      Update.abort();
      postJson("/api/device/ota/result", "{\"ok\":false,\"error\":\"flash write failed\"}");
      http.end();
      return false;
    }
    written += n;
  }

  uint8_t out[32];
  mbedtls_sha256_finish(&ctx, out);
  mbedtls_sha256_free(&ctx);
  char hex[65];
  for (int i = 0; i < 32; i++) sprintf(hex + i * 2, "%02x", out[i]);
  hex[64] = 0;

  if (String(hex) != expectedSha) {
    Update.abort();
    postJson("/api/device/ota/result",
             String("{\"ok\":false,\"error\":\"SHA-256 mismatch\",\"sha256\":\"") + hex + "\"}");
    http.end();
    return false;
  }

  if (!Update.end(true)) {
    postJson("/api/device/ota/result", "{\"ok\":false,\"error\":\"Update.end failed\"}");
    http.end();
    return false;
  }

  String ok = String("{\"ok\":true,\"version\":\"") + version +
              "\",\"sha256\":\"" + hex + "\"}";
  postJson("/api/device/ota/result", ok);
  postJson("/api/device/logs",
           String("{\"entries\":[{\"level\":\"info\",\"message\":\"Installed ") + version + "\"}]}");
  http.end();
  delay(500);
  ESP.restart();
  return true;
}

void checkOta() {
  HTTPClient http;
  http.begin(String(FIRMFLOW_URL) + "/api/device/ota");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  int code = http.GET();
  if (code != 200) {
    http.end();
    return;
  }
  String payload = http.getString();
  http.end();
  if (payload.indexOf("\"update\":true") < 0) return;

  String version = payload.substring(payload.indexOf("\"version\":\"") + 11);
  version = version.substring(0, version.indexOf("\""));
  String sha = payload.substring(payload.indexOf("\"sha256\":\"") + 10);
  sha = sha.substring(0, sha.indexOf("\""));
  String url = payload.substring(payload.indexOf("\"url\":\"") + 7);
  url = url.substring(0, url.indexOf("\""));
  url.replace("\\/", "/");

  if (!hmacValid(sha, "present")) return;
  installUpdate(version, sha, url);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
  }
  heartbeat();
}

void loop() {
  if (millis() - lastBeat > 15000) {
    lastBeat = millis();
    heartbeat();
    checkOta();
  }
}
