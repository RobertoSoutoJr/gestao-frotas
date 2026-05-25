const express = require('express');
const fipeController = require('../controllers/fipe.controller');

const router = express.Router();

// GET /fipe/marcas — lista marcas de caminhões
router.get('/marcas', fipeController.getMarcas);

// GET /fipe/marcas/:marcaCodigo/modelos — lista modelos de uma marca
router.get('/marcas/:marcaCodigo/modelos', fipeController.getModelos);

// GET /fipe/marcas/:marcaCodigo/modelos/:modeloCodigo/anos — lista anos
router.get('/marcas/:marcaCodigo/modelos/:modeloCodigo/anos', fipeController.getAnos);

// GET /fipe/marcas/:marcaCodigo/modelos/:modeloCodigo/anos/:anoCodigo — preço FIPE
router.get('/marcas/:marcaCodigo/modelos/:modeloCodigo/anos/:anoCodigo', fipeController.getPreco);

module.exports = router;
