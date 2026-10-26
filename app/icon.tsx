import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const file = await readFile(join(process.cwd(), "public/logo.png"));
  const src = `data:image/png;base64,${file.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 32,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={50} height={50} alt="" />
      </div>
    ),
    size,
  );
}
