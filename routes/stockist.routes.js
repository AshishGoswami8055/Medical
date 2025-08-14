const express = require('express');
const router = express.Router();
const stockistController = require('../controller/stockist.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');
const authentication = require('../middlewares/authentication');

router.post('/loginStockist', validations.loginStockist, handleValidations, stockistController.loginStockist);
router.patch('/status/:orderId', authentication, stockistController.changeOrderStatus);


module.exports = router;
