const fipeService = require('../services/fipe.service');

class FipeController {
  async getMarcas(req, res, next) {
    try {
      const data = await fipeService.getMarcas();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getModelos(req, res, next) {
    try {
      const { marcaCodigo } = req.params;
      const data = await fipeService.getModelos(marcaCodigo);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAnos(req, res, next) {
    try {
      const { marcaCodigo, modeloCodigo } = req.params;
      const data = await fipeService.getAnos(marcaCodigo, modeloCodigo);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPreco(req, res, next) {
    try {
      const { marcaCodigo, modeloCodigo, anoCodigo } = req.params;
      const data = await fipeService.getPreco(marcaCodigo, modeloCodigo, anoCodigo);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FipeController();
