import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const file = await readFile(join(process.cwd(), "public/logo.png"));
  const src = `data:image/png;base64,${file.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 90,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
