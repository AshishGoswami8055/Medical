const express = require('express');
const router = express.Router();
const stockistController = require('../controller/stockist.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

router.post('/loginStockist', validations.loginStockist, handleValidations, stockistController.loginStockist);

module.exports = router;
