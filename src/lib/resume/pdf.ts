import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFPage,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";
import type { ResumeData } from "./types";
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  CONTENT_WIDTH_PT,
  MARGIN_X_PT,
  MARGIN_TOP_PT,
  layoutResumeDocument,
  sanitizeForPdfWinAnsi,
} from "./document-layout";
import { buildResumeFilename } from "./validation";

function addLinkAnnotation(
  pdfDoc: PDFDocument,
  page: PDFPage,
  url: string,
  x: number,
  yBottom: number,
  width: number,
  height: number
) {
  if (!url || width <= 0 || height <= 0) return;
  const linkAnnot = pdfDoc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, yBottom, x + width, yBottom + height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(url),
    },
  });
  const ref = pdfDoc.context.register(linkAnnot);
  const existing = page.node.get(PDFName.of("Annots"));
  if (existing instanceof PDFArray) {
    existing.push(ref);
  } else {
    page.node.set(PDFName.of("Annots"), pdfDoc.context.obj([ref]));
  }
}

export async function generateResumePdfBytes(
  data: ResumeData,
  documentTitle?: string
): Promise<{ bytes: Uint8Array; filename: string; pageCount: number }> {
  const layout = layoutResumeDocument(data);
  const pdfDoc = await PDFDocument.create();

  const fullName = [data.personal.firstName.trim(), data.personal.lastName.trim()]
    .filter(Boolean)
    .join(" ");
  const filename = buildResumeFilename(data.personal, documentTitle);

  pdfDoc.setTitle(
    sanitizeForPdfWinAnsi(fullName ? `${fullName} - Resume` : documentTitle || "Resume")
  );
  if (fullName) {
    pdfDoc.setAuthor(sanitizeForPdfWinAnsi(fullName));
  }
  pdfDoc.setSubject("ATS-Friendly Resume");
  pdfDoc.setCreator("Zenoway ATS Resume Builder");
  pdfDoc.setProducer("Zenoway (pdf-lib)");

  const isTimes = data.fontFamily === "times";
  const fontRegular = await pdfDoc.embedFont(
    isTimes ? StandardFonts.TimesRoman : StandardFonts.Helvetica
  );
  const fontBold = await pdfDoc.embedFont(
    isTimes ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold
  );

  const colorPrimary = rgb(0.08, 0.09, 0.09); // #141717
  const colorSecondary = rgb(0.24, 0.27, 0.26); // #3d4542
  const colorMuted = rgb(0.35, 0.38, 0.37); // #59615e
  const colorLink = rgb(0.043, 0.4, 0.761); // #0b66c2

  for (const docPage of layout.pages) {
    const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
    let cursorY = A4_HEIGHT_PT - MARGIN_TOP_PT;

    for (const block of docPage.blocks) {
      if (block.type === "header") {
        if (block.fullName) {
          const safeName = sanitizeForPdfWinAnsi(block.fullName);
          page.drawText(safeName, {
            x: MARGIN_X_PT,
            y: cursorY - 15,
            size: 18,
            font: fontBold,
            color: colorPrimary,
          });
          cursorY -= 22;
        }

        if (block.headline) {
          const safeHeadline = sanitizeForPdfWinAnsi(block.headline);
          page.drawText(safeHeadline, {
            x: MARGIN_X_PT,
            y: cursorY - 9,
            size: 10.5,
            font: fontRegular,
            color: colorSecondary,
          });
          cursorY -= 15;
        }

        if (block.contactLines.length > 0) {
          const sep = "  |  ";
          const sepWidth = fontRegular.widthOfTextAtSize(sep, 9.5);
          for (const segLine of block.contactLines) {
            let x = MARGIN_X_PT;
            const baselineY = cursorY - 8;
            for (let sIdx = 0; sIdx < segLine.length; sIdx++) {
              const seg = segLine[sIdx];

              if (seg.label) {
                const safeLabel = sanitizeForPdfWinAnsi(seg.label);
                const labelW = fontRegular.widthOfTextAtSize(safeLabel, 9.5);
                page.drawText(safeLabel, {
                  x,
                  y: baselineY,
                  size: 9.5,
                  font: fontRegular,
                  color: colorSecondary,
                });
                x += labelW;
              }

              const safeText = sanitizeForPdfWinAnsi(seg.text);
              const textW = fontRegular.widthOfTextAtSize(safeText, 9.5);
              page.drawText(safeText, {
                x,
                y: baselineY,
                size: 9.5,
                font: fontRegular,
                color: seg.href ? colorLink : colorSecondary,
              });
              if (seg.href) {
                addLinkAnnotation(
                  pdfDoc,
                  page,
                  seg.href,
                  x,
                  baselineY - 2,
                  textW,
                  11
                );
              }
              x += textW;
              if (sIdx < segLine.length - 1) {
                page.drawText(sep, {
                  x,
                  y: baselineY,
                  size: 9.5,
                  font: fontRegular,
                  color: colorMuted,
                });
                x += sepWidth;
              }
            }
            cursorY -= 13;
          }
          cursorY -= 3;
        }

        cursorY -= 10;
      } else if (block.type === "section-heading") {
        cursorY -= 4;
        const safeTitle = sanitizeForPdfWinAnsi(block.title);
        page.drawText(safeTitle, {
          x: MARGIN_X_PT,
          y: cursorY - 9,
          size: 10.5,
          font: fontBold,
          color: colorPrimary,
        });
        cursorY -= 16;
      } else if (block.type === "split-row") {
        const fontLeft = block.boldLeft ? fontBold : fontRegular;
        const rightSize = Math.max(9, block.fontSizePt - 0.5);
        const safeRight = block.rightText
          ? sanitizeForPdfWinAnsi(block.rightText)
          : "";

        block.leftLines.forEach((line, lIdx) => {
          const safeLeft = sanitizeForPdfWinAnsi(line);
          const baselineY = cursorY - block.fontSizePt * 0.85;
          page.drawText(safeLeft, {
            x: MARGIN_X_PT,
            y: baselineY,
            size: block.fontSizePt,
            font: fontLeft,
            color: colorPrimary,
          });
          if (lIdx === 0 && safeRight) {
            const rightW = fontRegular.widthOfTextAtSize(safeRight, rightSize);
            page.drawText(safeRight, {
              x: MARGIN_X_PT + CONTENT_WIDTH_PT - rightW,
              y: baselineY,
              size: rightSize,
              font: fontRegular,
              color: colorSecondary,
            });
          }
          cursorY -= block.lineHeightPt;
        });
        cursorY -= block.spaceAfterPt;
      } else if (block.type === "paragraph") {
        const color = block.href
          ? colorLink
          : block.color === "muted"
            ? colorMuted
            : block.color === "secondary"
              ? colorSecondary
              : colorPrimary;
        const font = block.bold ? fontBold : fontRegular;
        for (const line of block.lines) {
          const safeLine = sanitizeForPdfWinAnsi(line);
          const baselineY = cursorY - block.fontSizePt * 0.85;
          page.drawText(safeLine, {
            x: MARGIN_X_PT,
            y: baselineY,
            size: block.fontSizePt,
            font,
            color,
          });
          if (block.href) {
            const lineW = font.widthOfTextAtSize(safeLine, block.fontSizePt);
            addLinkAnnotation(
              pdfDoc,
              page,
              block.href,
              MARGIN_X_PT,
              baselineY - 2,
              lineW,
              block.fontSizePt + 2
            );
          }
          cursorY -= block.lineHeightPt;
        }
        cursorY -= block.spaceAfterPt;
      } else if (block.type === "bullet") {
        block.lines.forEach((line, idx) => {
          const safeLine = sanitizeForPdfWinAnsi(line);
          const baselineY = cursorY - block.fontSizePt * 0.85;
          if (idx === 0) {
            page.drawText("•", {
              x: MARGIN_X_PT + 3,
              y: baselineY,
              size: block.fontSizePt,
              font: fontRegular,
              color: colorPrimary,
            });
          }
          page.drawText(safeLine, {
            x: MARGIN_X_PT + 14,
            y: baselineY,
            size: block.fontSizePt,
            font: fontRegular,
            color: colorPrimary,
          });
          cursorY -= block.lineHeightPt;
        });
        cursorY -= block.spaceAfterPt;
      } else if (block.type === "skill-line") {
        for (const line of block.lines) {
          const baselineY = cursorY - block.fontSizePt * 0.85;
          let x = MARGIN_X_PT;
          if (line.categoryPrefix) {
            const safePrefix = sanitizeForPdfWinAnsi(line.categoryPrefix);
            page.drawText(safePrefix, {
              x,
              y: baselineY,
              size: block.fontSizePt,
              font: fontBold,
              color: colorPrimary,
            });
            x += fontBold.widthOfTextAtSize(safePrefix, block.fontSizePt);
          }
          if (line.text) {
            const safeText = sanitizeForPdfWinAnsi(line.text);
            page.drawText(safeText, {
              x,
              y: baselineY,
              size: block.fontSizePt,
              font: fontRegular,
              color: colorPrimary,
            });
          }
          cursorY -= block.lineHeightPt;
        }
        cursorY -= block.spaceAfterPt;
      } else if (block.type === "entry-gap") {
        cursorY -= block.heightPt;
      }
    }

    // For multi-page resumes, draw a clean page numbering footer in the bottom margin
    if (layout.pages.length > 1) {
      const pageNumberText = `Page ${docPage.pageNumber} of ${layout.pages.length}`;
      const pageNumberWidth = fontRegular.widthOfTextAtSize(pageNumberText, 8.5);
      page.drawText(pageNumberText, {
        x: MARGIN_X_PT + CONTENT_WIDTH_PT - pageNumberWidth,
        y: 24,
        size: 8.5,
        font: fontRegular,
        color: colorMuted,
      });

      const fullName = [data.personal.firstName.trim(), data.personal.lastName.trim()]
        .filter(Boolean)
        .join(" ");
      if (fullName && docPage.pageNumber > 1) {
        const safeName = sanitizeForPdfWinAnsi(fullName);
        page.drawText(safeName, {
          x: MARGIN_X_PT,
          y: 24,
          size: 8.5,
          font: fontRegular,
          color: colorMuted,
        });
      }
    }
  }

  const bytes = await pdfDoc.save();
  return {
    bytes,
    filename,
    pageCount: layout.pages.length,
  };
}

