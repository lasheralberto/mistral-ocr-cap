import cds from '@sap/cds';
import express from 'express';
import bodyParser from 'body-parser';

cds.on('bootstrap', app => {
  // Aumentar límite de JSON a 50MB
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  // Habilitar CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // o limita a localhost
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });
});

export default cds.server;
