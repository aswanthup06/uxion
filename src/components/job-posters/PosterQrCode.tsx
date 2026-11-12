"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

interface PosterQrCodeProps {
  value: string;
  size?: number;
  darkColor?: string;
  borderColor?: string;
  padding?: number;
  borderRadius?: number;
}

/**
 * Synchronous, deterministic SVG QR code with a guaranteed white quiet-zone plate
 * so html-to-image exports razor-sharp, scannable QR codes offline without CORS issues.
 */
export function PosterQrCode({
  value,
  size = 100,
  darkColor = "#17251F",
  borderColor = "#DDE8DF",
  padding = 8,
  borderRadius = 6,
}: PosterQrCodeProps) {
  const { pathData, viewBoxSize } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    const count = qr.modules.size;
    const quiet = 2;
    const segments: string[] = [];

    for (let row = 0; row < count; row++) {
      let col = 0;
      while (col < count) {
        if (qr.modules.get(row, col)) {
          const startCol = col;
          while (col < count && qr.modules.get(row, col)) {
            col++;
          }
          const runLen = col - startCol;
          segments.push(
            `M${startCol + quiet},${row + quiet}h${runLen}v1h-${runLen}z`
          );
        } else {
          col++;
        }
      }
    }

    return {
      pathData: segments.join(""),
      viewBoxSize: count + quiet * 2,
    };
  }, [value]);

  const svgSize = Math.max(48, size - padding * 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        padding,
        borderRadius,
        backgroundColor: "#FFFFFF",
        border: borderColor === "none" ? "none" : `1px solid ${borderColor}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`QR code for ${value}`}
        style={{ display: "block" }}
      >
        <rect width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />
        <path d={pathData} fill={darkColor} shapeRendering="crispEdges" />
      </svg>
    </div>
  );
}

