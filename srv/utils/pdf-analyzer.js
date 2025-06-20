import fs from 'fs/promises';
import fetch from 'node-fetch';
import PDFParser from 'pdf2json';

export class PDFAnalyzer {
  constructor(source) {
    this.source = source;
  }

  isURL() {
    return /^https?:\/\//i.test(this.source);
  }

  async loadPDFBuffer() {
    if (this.isURL()) {
      const response = await fetch(this.source);
      if (!response.ok) {
        throw new Error(`Error al descargar el PDF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      return await fs.readFile(this.source);
    }
  }

  async isScanned() {
    const buffer = await this.loadPDFBuffer();
    const pdfParser = new PDFParser(null, 1);

    return new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', err => {
        console.error('Error analizando PDF:', err.parserError);
        resolve(true); // Asume escaneado si falla
      });

      pdfParser.on('pdfParser_dataReady', pdfData => {
        const text = pdfParser.getRawTextContent().trim();
        const textLength = text.length;
        const wordsCount = text.split(/\s+/).length;

        // Criterios: muy poco texto -> probablemente escaneado
        const isScanned = textLength < 50 || wordsCount < 10;
        console.log("is scanned?", isScanned);
        resolve(isScanned);
      });

      pdfParser.parseBuffer(buffer);
    });
  }
}
