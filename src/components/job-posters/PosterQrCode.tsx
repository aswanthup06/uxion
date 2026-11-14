"use client";

import React from "react";
import { QRCode } from "@ttsalpha/qrcode";
import {
  ZENOWAY_EMERALD,
  ZENOWAY_LEAF_DATA_URI,
  type QrCornerStyle,
  type QrDotStyle,
} from "@/lib/job-posters/qr-generator";

export interface PosterQrCodeProps {
  value: string;
  size?: number;
  darkColor?: string;
  bgColor?: string;
  borderColor?: string;
  padding?: number;
  borderRadius?: number;
  dotStyle?: QrDotStyle;
  cornerStyle?: QrCornerStyle;
  withLogo?: boolean;
  logoSize?: number;
}

/**
 * Premium, branded Zenoway QR code component powered by @ttsalpha/qrcode.
 * Renders pure scalable SVG with rounded dots, customized corner patterns,
 * error correction level H, and optional Zenoway leaf emblem.
 *
 * Fully compatible with Next.js App Router and html-to-image offline canvas export.
 */
export function PosterQrCode({
  value,
  size = 116,
  darkColor = ZENOWAY_EMERALD,
  bgColor = "#FFFFFF",
  borderColor = "#DDE8DF",
  padding = 6,
  borderRadius = 0,
  dotStyle = "rounded",
  cornerStyle = "extra-rounded",
  withLogo = false,
  logoSize = 0.36,
}: PosterQrCodeProps) {
  const qrSvgSize = Math.max(48, size - padding * 2);
  const showBorder =
    borderColor && borderColor !== "none" && borderColor !== "transparent";

  return (
    <div
      style={{
        width: size,
        height: size,
        padding,
        borderRadius,
        backgroundColor: bgColor,
        border: showBorder ? `1px solid ${borderColor}` : "none",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <QRCode
        value={value}
        size={qrSvgSize}
        margin={2}
        dotStyle={dotStyle}
        dotColor={darkColor}
        backgroundColor={bgColor}
        corner={{
          square: {
            style: cornerStyle,
            color: darkColor,
          },
          dot: {
            style: cornerStyle === "circle" ? "circle" : "rounded",
            color: darkColor,
          },
        }}
        logo={
          withLogo
            ? {
                src: ZENOWAY_LEAF_DATA_URI,
                size: logoSize,
                margin: 1,
                radius: 1,
                hideDots: true,
              }
            : undefined
        }
        qr={{
          errorCorrectionLevel: withLogo ? "H" : "M",
        }}
        ariaLabel={`Zenoway QR code for ${value}`}
        style={{ display: "block" }}
      />
    </div>
  );
}
