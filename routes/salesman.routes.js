const express = require('express');
const router = express.Router();
const salesmanController = require('../controller/salesman.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

// router.post('/loginSalesman', validations.loginSalesman, handleValidations, salesmanController.loginSalesman);

module.exports = router;
