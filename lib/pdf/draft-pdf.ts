import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import {
  PDFDocument,
  PDFEmbeddedPage,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

const PAGE_WIDTH = 595.28; // A4 em pontos
const PAGE_HEIGHT = 841.89;
const MARGIN = { top: 64, bottom: 56, left: 56, right: 56 };
const BODY_FONT_SIZE = 11;
const LINE_HEIGHT = BODY_FONT_SIZE * 1.45;
// Reserva de topo quando o timbre é imagem (logo encaixado no cabeçalho).
const IMAGE_LETTERHEAD_HEIGHT = 64;
// Reserva de topo quando o timbre é PDF (fundo de página completa: deixa
// espaço para o cabeçalho típico de papel timbrado A4).
const PDF_LETTERHEAD_HEADER_RESERVE = 96;
const LETTERHEAD_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const LETTERHEAD_PDF_EXTENSIONS = new Set([".pdf"]);
const LETTERHEAD_WORD_EXTENSIONS = new Set([".doc", ".docx"]);

export type DraftPdfInput = {
  title: string;
  content: string;
  caseTitle: string;
  clientName: string | null;
  letterheadPath: string | null;
};

export type DraftPdfResult = {
  bytes: Uint8Array;
  letterheadApplied: boolean;
  letterheadWarning: string | null;
};

type LetterheadAsset =
  | { kind: "image"; image: PDFImage; warning: null }
  | { kind: "pdf"; page: PDFEmbeddedPage; warning: null }
  | { kind: "none"; warning: string };

export async function renderDraftPdf(
  input: DraftPdfInput,
): Promise<DraftPdfResult> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const letterhead = await loadLetterhead(doc, input.letterheadPath);
  const headerHeight =
    letterhead.kind === "image"
      ? IMAGE_LETTERHEAD_HEIGHT
      : letterhead.kind === "pdf"
        ? PDF_LETTERHEAD_HEADER_RESERVE
        : 0;
  const maxWidth = PAGE_WIDTH - MARGIN.left - MARGIN.right;
  const bodyLines = wrapText(
    stripMarkdownSyntax(input.content),
    font,
    BODY_FONT_SIZE,
    maxWidth,
  );

  function newPage() {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawLetterhead(page, letterhead, headerHeight);
    return page;
  }

  let page = newPage();
  let cursorY = PAGE_HEIGHT - MARGIN.top - headerHeight;

  page.drawText(sanitizeForStandardFont(input.title), {
    x: MARGIN.left,
    y: cursorY,
    size: 14,
    font: boldFont,
  });
  cursorY -= 20;

  const metaText = sanitizeForStandardFont(
    [input.caseTitle, input.clientName].filter(Boolean).join(" · "),
  );
  if (metaText) {
    page.drawText(metaText, {
      x: MARGIN.left,
      y: cursorY,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    cursorY -= 24;
  } else {
    cursorY -= 12;
  }

  for (const line of bodyLines) {
    if (cursorY < MARGIN.bottom) {
      page = newPage();
      cursorY = PAGE_HEIGHT - MARGIN.top - headerHeight;
    }
    if (line) {
      page.drawText(sanitizeForStandardFont(line), {
        x: MARGIN.left,
        y: cursorY,
        size: BODY_FONT_SIZE,
        font,
      });
    }
    cursorY -= LINE_HEIGHT;
  }

  const bytes = await doc.save();
  return {
    bytes,
    letterheadApplied: letterhead.kind !== "none",
    letterheadWarning: letterhead.warning,
  };
}

async function loadLetterhead(
  doc: PDFDocument,
  path: string | null,
): Promise<LetterheadAsset> {
  if (!path) {
    return {
      kind: "none",
      warning:
        "Nenhum papel timbrado configurado para este escritório. O documento foi gerado sem timbre.",
    };
  }

  const ext = extname(path).toLowerCase();

  if (LETTERHEAD_IMAGE_EXTENSIONS.has(ext)) {
    return loadLetterheadImage(doc, path, ext);
  }

  if (LETTERHEAD_PDF_EXTENSIONS.has(ext)) {
    return loadLetterheadPdf(doc, path);
  }

  if (LETTERHEAD_WORD_EXTENSIONS.has(ext)) {
    return {
      kind: "none",
      warning:
        "O papel timbrado configurado está em Word (.doc/.docx) e ainda não é aplicado automaticamente. Configure um PDF, PNG ou JPG para o timbre aparecer na exportação.",
    };
  }

  return {
    kind: "none",
    warning:
      "O formato do papel timbrado configurado não é suportado na exportação. Use PDF, PNG ou JPG.",
  };
}

async function loadLetterheadImage(
  doc: PDFDocument,
  path: string,
  ext: string,
): Promise<LetterheadAsset> {
  try {
    const bytes = await readFile(path);
    const image =
      ext === ".png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    return { kind: "image", image, warning: null };
  } catch {
    return {
      kind: "none",
      warning:
        "Não foi possível carregar o papel timbrado configurado; o documento foi gerado sem ele.",
    };
  }
}

async function loadLetterheadPdf(
  doc: PDFDocument,
  path: string,
): Promise<LetterheadAsset> {
  try {
    const bytes = await readFile(path);
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = source.getPages();
    if (pages.length === 0) {
      return {
        kind: "none",
        warning:
          "O PDF de papel timbrado configurado não tem páginas; o documento foi gerado sem timbre.",
      };
    }
    // Primeira página do timbrado vira fundo de cada página da peça.
    const embedded = await doc.embedPage(pages[0]);
    return { kind: "pdf", page: embedded, warning: null };
  } catch {
    return {
      kind: "none",
      warning:
        "Não foi possível carregar o papel timbrado em PDF; o documento foi gerado sem ele.",
    };
  }
}

function drawLetterhead(
  page: PDFPage,
  letterhead: LetterheadAsset,
  headerHeight: number,
) {
  if (letterhead.kind === "image") {
    drawLetterheadImage(page, letterhead.image, headerHeight);
    return;
  }
  if (letterhead.kind === "pdf") {
    drawLetterheadPdfPage(page, letterhead.page);
  }
}

function drawLetterheadImage(page: PDFPage, image: PDFImage, maxHeight: number) {
  const maxWidth = PAGE_WIDTH - MARGIN.left - MARGIN.right;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, {
    x: MARGIN.left,
    y: PAGE_HEIGHT - MARGIN.top - height + (maxHeight - height),
    width,
    height,
  });
}

// Desenha a 1ª página do PDF de timbrado como fundo da página A4 gerada.
// Escala com proporção preservada e centraliza (timbrados costumam ser A4;
// se o PDF de origem for de outro tamanho, não estica distorcendo).
function drawLetterheadPdfPage(page: PDFPage, embedded: PDFEmbeddedPage) {
  const scale = Math.min(
    PAGE_WIDTH / embedded.width,
    PAGE_HEIGHT / embedded.height,
  );
  const width = embedded.width * scale;
  const height = embedded.height * scale;
  const x = (PAGE_WIDTH - width) / 2;
  const y = (PAGE_HEIGHT - height) / 2;
  page.drawPage(embedded, { x, y, width, height });
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (
        current &&
        font.widthOfTextAtSize(sanitizeForStandardFont(candidate), size) >
          maxWidth
      ) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

// Rede de segurança: o prompt já instrui a IA a nunca usar Markdown no
// conteúdo da peça, mas se algum modelo escapar dessa regra, símbolos crus
// (**, #, `) apareceriam literalmente no PDF. Remove a sintaxe sem tentar
// recriar negrito/títulos — o objetivo é nunca deixar o documento "sujo".
function stripMarkdownSyntax(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^#{1,6}\s*/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/`([^`]*)`/g, "$1")
        .replace(/^[*-]\s+/, "- "),
    )
    .join("\n");
}

// pdf-lib só codifica WinAnsi com as fontes padrão; textos gerados por IA às
// vezes trazem pontuação Unicode (aspas curvas, travessão longo, emoji) que
// quebrariam o PDF inteiro. Normaliza pro equivalente ASCII/Latin-1 mais
// próximo em vez de deixar a exportação falhar por um caractere isolado.
function sanitizeForStandardFont(text: string) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}
