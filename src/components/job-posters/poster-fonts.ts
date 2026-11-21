import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Syne,
} from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

export const posterFontsClassName = `${spaceGrotesk.variable} ${plusJakarta.variable} ${playfair.variable} ${syne.variable}`;
