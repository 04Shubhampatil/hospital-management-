import { createWorker } from "tesseract.js";
import pdfParse from "pdf-parse";
import fs from "fs";

export async function extractTextFromImage(filePath) {
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(filePath);
  await worker.terminate();
  return data.text;
}

export async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractText(filePath) {
  const ext = filePath.toLowerCase();
  if (ext.endsWith(".pdf")) {
    return extractTextFromPdf(filePath);
  }
  return extractTextFromImage(filePath);
}
