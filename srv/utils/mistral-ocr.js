import { Mistral } from "@mistralai/mistralai";
import fs from 'fs';
import path from 'path';
import { PDFAnalyzer } from './pdf-analyzer.js';
import { typeDocumentEnum } from "./enums.js";
import { processingTypeEnum } from "./enums.js";

/**
 * Clase para procesar documentos usando OCR de Mistral AI con extracción estructurada de datos
 */
export class MistralOcr {
    /**
     * Constructor de la clase MistralOcr
     * @param {string} schema - Esquema JSON en formato string que define la estructura de datos a extraer
     * @param {string} apiKey - Clave de API para autenticación con Mistral AI
     */
    constructor(schema, apiKey) {
        this.schema = schema;
        this.client = new Mistral({ apiKey: apiKey });
    }

    /**
     * Obtiene un array con las rutas absolutas de los archivos PDF desde múltiples carpetas.
     * @param {string[]} folderPaths - Array de rutas de las carpetas donde buscar los PDFs.
     * @returns {string[]} Array consolidado de rutas de archivos PDF de todas las carpetas.
     */
    getPdfPaths(folderPaths) {
        let allPdfPaths = [];

        try {
            // Iterar sobre cada carpeta proporcionada
            for (const folderPath of folderPaths) {
                try {
                    // Leer archivos de la carpeta actual
                    const files = fs.readdirSync(folderPath);

                    // Filtrar solo archivos PDF y crear rutas absolutas
                    const pdfPaths = files
                        .filter(file => path.extname(file).toLowerCase() === '.pdf')
                        .map(file => path.join(folderPath, file));

                    // Agregar los PDFs encontrados al array consolidado
                    allPdfPaths = allPdfPaths.concat(pdfPaths);

                } catch (err) {
                    console.error(`Error al leer la carpeta ${folderPath}:`, err.message);
                    // Continúa con las siguientes carpetas aunque una falle
                }
            }

            return allPdfPaths;

        } catch (err) {
            console.error('Error general al procesar las carpetas:', err.message);
            return [];
        }
    }

    /**
     * Función para leer desde un path un pdf y codificarlo a base64 para procesar el OCR.
     * Lee un archivo PDF desde el sistema de archivos y lo convierte a formato base64
     * @param {string} pdfPath - Ruta del archivo PDF en el sistema de archivos
     * @returns {Promise<string|null>} String en formato base64 del PDF o null si hay error
     */
    async encodePdf(pdfPath) {
        try {

            const pdfBuffer = fs.readFileSync(pdfPath);

            // Convert the buffer to a Base64-encoded string
            const base64Pdf = pdfBuffer.toString('base64');
            return base64Pdf;

        } catch (e) {
            console.error(`Error: ${e}`);
            return null;

        }
    }

    /**
     * Función para procesar OCR con extracción estructurada de datos
     * Procesa un documento utilizando el servicio OCR de Mistral AI, extrayendo datos según el esquema definido
     * @param {string} documentUrl - URL del documento o ruta del archivo (dependiendo del processingType)
     * @param {string} typedocument - Tipo de documento a procesar (ej: 'pdf', 'image', etc.)
     * @param {string} processingType - Tipo de procesamiento: 'base64' para archivos locales o 'url' para documentos en línea
     * @returns {Promise<Object|Error>} Respuesta del OCR con datos estructurados o error si falla el procesamiento
     */
    async processOCRWithStructuredData({
        documentUrl = null,
        base64 = null,
        typedocument,
        processingType,
        schema = null
    }) {
        try {

            let ocrResponse = null;
            let schemaParsed = JSON.parse(schema);

            let documentDict = {}
            let base64Pdf = null;

            if (processingType === processingTypeEnum.LOCAL) {
                // lógica para base64

                base64Pdf = await this.encodePdf(documentUrl);
                documentDict = {
                    type: typeDocumentEnum.DOCUMENT_URL,
                    documentUrl: "data:application/pdf;base64," + base64Pdf,
                }

                ocrResponse = await this.client.ocr.process({
                    model: "mistral-ocr-latest",
                    document: documentDict,
                    includeImageBase64: true,
                    documentAnnotationFormat: {
                        type: "json_schema",
                        jsonSchema: {
                            name: "Invoice",
                            schemaDefinition: schemaParsed,
                        },
                    },
                });

            } else if (processingType === processingTypeEnum.URL) {

                if (typedocument === typeDocumentEnum.IMAGE_URL) {
                    documentDict = {
                        type: typedocument,
                        imageUrl: documentUrl
                    }
                } else {
                    documentDict = {
                        type: typedocument,
                        documentUrl,
                    }
                }


                // lógica para url
                ocrResponse = await this.client.ocr.process({
                    model: "mistral-ocr-latest",
                    document: documentDict,
                    includeImageBase64: true,
                    documentAnnotationFormat: {
                        type: "json_schema",
                        jsonSchema: {
                            name: "Invoice",
                            schemaDefinition: schemaParsed,
                        },
                    },
                });

            } else if (processingType === processingTypeEnum.BASE64) {



                documentDict = {
                    type: 'document_url',
                    documentUrl: "data:application/pdf;base64," + base64,
                }

                console.log("Documento en base64:", documentDict);

                console.log("Procesando OCR con base64");

                ocrResponse = await this.client.ocr.process({
                    model: "mistral-ocr-latest",
                    document: documentDict,
                    includeImageBase64: true,
                    documentAnnotationFormat: {
                        type: "json_schema",
                        jsonSchema: {
                            name: "Invoice",
                            schemaDefinition: schemaParsed,
                        },
                    },
                });
            }

            return ocrResponse;

        } catch (error) {
            console.error("Error al procesar OCR estructurado:", error);
            return error;
        }
    }

    /**
     * Función para procesar múltiples documentos
     * Procesa una lista de documentos de forma secuencial utilizando OCR estructurado
     * @param {Array<string>} documentUrls - Array de URLs o rutas de documentos a procesar
     * @param {string} typedocument - Tipo de documento a procesar. "url" para archivos en la web, "base64" para leer desde archivos locales 
     * @returns {Promise<Array<Object>>} Array de objetos con el nombre del documento y los datos extraídos
     */
    async processBatchOCR(documentUrls, typedocument, processingType, base64 = null) {

        console.log("Procesando documentos con tipo:", typedocument);
        let responseAll = [];

        if (processingType === processingTypeEnum.BASE64) {
            console.log("Procesando en base64");
            let response = await this.processOCRWithStructuredData({
                documentUrl: null,
                base64: base64,
                typedocument: typedocument,
                processingType: processingType,
                schema: this.schema
            });


            responseAll.push({
                documentName: 'test',
                data: response.documentAnnotation
            });

        } else {
            let responseAll = [];
            for (let i = 0; i < documentUrls.length; i++) {

                let url = documentUrls[i];

                //Analizamos si está digitalizado o es una imagen
                const analyzer = new PDFAnalyzer(url);
                const scanned = await analyzer.isScanned();

                if (scanned) {
                    typedocument = typeDocumentEnum.IMAGE_URL;
                    console.log("Ha detectado imagen");
                }

                let response = await this.processOCRWithStructuredData(url, typedocument, processingType);

                // Extraer el nombre del documento desde la URL
                let nombreDocumento = url.split('/').pop(); // o usar otra lógica si es distinta

                responseAll.push({
                    documentName: nombreDocumento,
                    data: response.documentAnnotation
                });
                console.log(`Documento procesado: ${responseAll[i]}`);
            }

        }

        console.log("Todos los documentos procesados:", responseAll);
        return responseAll;
    }

}