const express = require('express');
const router = express.Router();
const chemistController = require('../controller/chemist.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

router.post('/registerChemist', validations.registerChemist, handleValidations, chemistController.registerChemist);
router.post('/loginChemist', validations.loginChemist, handleValidations, chemistController.loginChemist);

module.exports = router;
