const express = require('express');
const router = express.Router();
const mrController = require('../controller/mr.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

router.post('/loginMR', validations.loginMR, handleValidations, mrController.loginMR);
router.get('/profile', validations.jwtValidationMR, handleValidations, mrController.profile);
router.get('/allProducts', validations.jwtValidationMR, handleValidations, mrController.allProducts);
router.post('/change-password', validations.jwtValidationMR, handleValidations, mrController.changePassword);

router.get('/getProduct/:productId', validations.jwtValidationMR, handleValidations, mrController.getProduct);
router.get("/getSingleProduct/:productName", validations.jwtValidationMR, handleValidations, mrController.getSingleProduct);

router.get('/getChemists', validations.jwtValidationMR, handleValidations, mrController.getChemists);
router.get("/getChemistOfMR", validations.jwtValidationMR, handleValidations, mrController.getChemistOfMR);
router.get("/getChemist/:chemistId", validations.jwtValidationMR, handleValidations, mrController.getChemist);

router.get("/getMyCart", validations.jwtValidationMR, handleValidations, mrController.getMyCart);
router.get("/getMyCartCount", validations.jwtValidationMR, handleValidations, mrController.getMyCartCount);

module.exports = router;
