
import { MistralOcr } from './utils/mistral-ocr.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { processingTypeEnum, typeDocumentEnum } from './utils/enums.js';

// Configuración

export default cds.service.impl(async function () {
  this.on('performScan', async (req) => {
    try {

      // Obtener configuración del header
      const authHeader = req._.req.headers['x-api-key'];

      if (!authHeader) {
        return req.error(401, 'Authorization Bearer token requerido');
      }

      const token = authHeader;

      // Obtener query y metadata del body
      let { type, schema, urls, processingType , base64 } = req.data.query;
      
      console.log("Base64:", base64[0]); 
  
      const mistral = new MistralOcr(schema, token);

      if (processingType === processingTypeEnum.URL) {
        //Dejamos aquí de momento, por si tenemos que ampliar lógica en un futuro.
      
      } else if (processingType === processingTypeEnum.BASE64) {

      } else if (processingType === processingTypeEnum.LOCAL ) {
        //Obtenemos de las N rutas especificadas un array de paths locales para leerlos después en base64.
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const resourcesDir = path.join(__dirname, 'resources');
        const filesFromResource = [
          path.join(resourcesDir, 'files')
        ];

        let filesFromPath = mistral.getPdfPaths(filesFromResource);
        urls = filesFromPath;


      }
    

      let responseAll = await mistral.processBatchOCR(urls,typeDocumentEnum.DOCUMENT_URL, processingType, base64[0]);

      return responseAll;


    } catch (e) {

      return req.error(500, `Error: ${e.message}\n${e.stack}`);


    }
  });
});


