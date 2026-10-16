import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF4D5A",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "18px solid white",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#61FFA0",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
