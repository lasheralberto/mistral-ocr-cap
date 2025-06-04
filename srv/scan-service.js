import { json } from '@sap/cds/lib/compile/parse.js';
import { MistralOcr } from './utils/mistral-ocr.js';

// Configuración

export default cds.service.impl(async function () {
  this.on('performScan', async (req) => {
    try {

      // Obtener configuración del header
      const authHeader = req._.req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return req.error(401, 'Authorization Bearer token requerido');
      }

      const token = authHeader.split(' ')[1];

      // Obtener query y metadata del body
      const { type, schema, urls } = req.data.query;

      const mistral = new MistralOcr(schema,token);
      let response = mistral.processBatchOCR(urls, type);

      return response;


    } catch (e) {

      return req.error(500, `Error: ${e.message}\n${e.stack}`);


    }
  });
});


