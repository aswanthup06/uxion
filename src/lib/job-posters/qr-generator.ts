import { toSVGString, buildQR } from "@ttsalpha/qrcode/core";

export const ZENOWAY_EMERALD = "#064E3B";
export const ZENOWAY_EMERALD_DEEP = "#04382A";
export const ZENOWAY_WHITE = "#FFFFFF";

export type QrDotStyle = "rounded" | "circle" | "square";
export type QrCornerStyle = "extra-rounded" | "rounded" | "square" | "circle";

/**
 * High-contrast, vector-sharp Zenoway leaf emblem embedded as an inline SVG data URI.
 * Renders offline with zero network requests or CORS issues.
 */
export const ZENOWAY_LEAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="32" fill="#FFFFFF"/><circle cx="32" cy="32" r="28" fill="#FFFFFF" stroke="#064E3B" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="#064E3B"/><path d="M30 40A7.5 7.5 0 0 1 28.5 24.5C34.5 23.3 36 22.7 38.5 19.5c1.2 2.2 2 4.7 2 8.7 0 6-5 11.8-10.5 11.8Z" fill="#FFFFFF"/><path d="M21 41c0-3.2 2-5.8 5.4-6.6 2.5-.5 5-2.1 6.2-3.1" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;

export const ZENOWAY_LEAF_DATA_URI =
  "data:image/svg+xml;utf8," + encodeURIComponent(ZENOWAY_LEAF_SVG);

export interface GenerateJobQrOptions {
  value: string;
  size?: number;
  dotStyle?: QrDotStyle;
  cornerStyle?: QrCornerStyle;
  dotColor?: string;
  cornerColor?: string;
  backgroundColor?: string;
  withLogo?: boolean;
  logoSize?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Builds deterministic, accessible, standalone SVG string for any job destination URL.
 */
export function generateJobQrSvg({
  value,
  size = 512,
  dotStyle = "rounded",
  cornerStyle = "extra-rounded",
  dotColor = ZENOWAY_EMERALD,
  cornerColor,
  backgroundColor = ZENOWAY_WHITE,
  withLogo = false,
  logoSize = 0.36,
  margin = 3,
  errorCorrectionLevel,
}: GenerateJobQrOptions): string {
  const finalCornerColor = cornerColor || dotColor;
  const ecl = errorCorrectionLevel || (withLogo ? "H" : "M");

  return toSVGString({
    value,
    size,
    margin,
    dotStyle,
    dotColor,
    backgroundColor,
    corner: {
      square: {
        style: cornerStyle,
        color: finalCornerColor,
      },
      dot: {
        style: cornerStyle === "circle" ? "circle" : "rounded",
        color: finalCornerColor,
      },
    },
    logo: withLogo
      ? {
          src: ZENOWAY_LEAF_DATA_URI,
          size: logoSize,
          margin: 1,
          radius: 1,
          hideDots: true,
        }
      : undefined,
    qr: {
      errorCorrectionLevel: ecl,
    },
    ariaLabel: `Zenoway QR Code for ${value}`,
  });
}

/**
 * Trigger immediate browser download of the pure vector SVG file.
 */
export function exportJobQrAsSvg(
  jobUrl: string,
  filename = "zenoway-job-qr.svg",
  options?: Partial<GenerateJobQrOptions>
): void {
  if (typeof window === "undefined") return;

  const svgString = generateJobQrSvg({
    value: jobUrl,
    size: 1024,
    ...options,
  });

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

/**
 * Render ultra-high-resolution (e.g. 2048x2048px for print/WhatsApp/Instagram) PNG from vector SVG.
 */
export async function exportJobQrAsPng(
  jobUrl: string,
  filename = "zenoway-job-qr.png",
  options?: Partial<GenerateJobQrOptions>,
  targetSize = 2048
): Promise<void> {
  if (typeof window === "undefined") return;

  const svgString = generateJobQrSvg({
    value: jobUrl,
    size: targetSize,
    ...options,
  });

  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D canvas context");
        }

        // Draw crisp white background & SVG image
        ctx.fillStyle = options?.backgroundColor || ZENOWAY_WHITE;
        ctx.fillRect(0, 0, targetSize, targetSize);
        ctx.drawImage(img, 0, 0, targetSize, targetSize);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          downloadBlob(
            blob,
            filename.endsWith(".png") ? filename : `${filename}.png`
          );
          resolve();
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load QR SVG as image: ${e}`));
    };

    img.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
