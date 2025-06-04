import { Mistral } from "@mistralai/mistralai";

export class MistralOcr {
    constructor(schema, apiKey) {
        this.schema = schema;
        this.client = new Mistral({ apiKey: apiKey });
    }
    // Función para procesar OCR con extracción estructurada de datos
    async processOCRWithStructuredData(documentUrl, typedocument) {
        try {
 
            let schemaParsed = JSON.parse(this.schema);
  
            const ocrResponse = await this.client.ocr.process({
                model: "mistral-ocr-latest",
                document: {
                    type: typedocument,
                    documentUrl,
                },
                includeImageBase64: false,
                documentAnnotationFormat: {
                    type: "json_schema",
                    jsonSchema: {
                        name: "Invoice",
                        schemaDefinition: schemaParsed,
                    },
                },
            });

            return ocrResponse;

        } catch (error) {
            console.error("Error al procesar OCR estructurado:", error);
            return error;
        }
    }

    // Función para procesar múltiples documentos
    async processBatchOCR(documentUrls, typedocument) {
        for (let i = 0; i < documentUrls.length; i++) {
            console.log(
                `\n=== Procesando documento ${i + 1}/${documentUrls.length} ===`,
            );
            let response = await this.processOCRWithStructuredData(documentUrls[i], typedocument);

            

            if (i < documentUrls.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            return response;
        }
    }

}
