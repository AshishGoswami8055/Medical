const express = require('express');
const router = express.Router();
const mrController = require('../controller/mr.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

router.post('/loginMR', validations.loginMR, handleValidations, mrController.loginMR);

module.exports = router;
