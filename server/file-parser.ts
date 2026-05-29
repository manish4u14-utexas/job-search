/**
 * File parsing utilities for resume uploads
 */

import type { Result } from "mammoth";

// Dynamic imports to handle ESM/CJS compatibility
let pdfParse: any;
let mammoth: any;

async function loadParsers() {
  if (!pdfParse) {
    pdfParse = (await import("pdf-parse")).default;
  }
  if (!mammoth) {
    mammoth = await import("mammoth");
  }
}

/**
 * Parse PDF file and extract text
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    await loadParsers();
    console.log("Parsing PDF, buffer size:", buffer.length);
    const data = await pdfParse(buffer);
    console.log("PDF parsed successfully, text length:", data.text.length);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse DOCX file and extract text
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    await loadParsers();
    console.log("Parsing DOCX, buffer size:", buffer.length);
    const result = await mammoth.extractRawText({ buffer });
    console.log("DOCX parsed successfully, text length:", result.value.length);
    return result.value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error(`Failed to parse DOCX file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse file based on mime type
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  console.log("parseFile called with mimeType:", mimeType, "buffer size:", buffer.length);
  
  if (mimeType === "application/pdf") {
    return parsePDF(buffer);
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return parseDOCX(buffer);
  } else if (mimeType === "text/plain") {
    const text = buffer.toString("utf-8");
    console.log("Plain text file, length:", text.length);
    return text;
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
