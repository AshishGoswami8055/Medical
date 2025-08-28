const express = require('express');
const router = express.Router();
const chemistController = require('../controller/chemist.controller');
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');
const uploadImage = require('../middlewares/upload');
const authentication = require('../middlewares/authentication');

router.post('/registerChemist', uploadImage("drugLicense",[{ name: "drugLicenseImage", maxCount: 1}]), validations.registerChemist, handleValidations, chemistController.registerChemist);
router.post('/loginChemist', validations.loginChemist, handleValidations, chemistController.loginChemist);
router.get('/profile', validations.jwtValidationChemist, handleValidations, chemistController.profile);
router.post("/change-password", validations.jwtValidationChemist, chemistController.changePassword);

// router.get('/getProduct/:productId', validations.jwtValidationChemist, chemistController.getProduct);
// router.get("/getSingleProduct/:productName", validations.jwtValidationChemist, chemistController.getSingleProduct);
// router.get('/allProducts', validations.jwtValidationChemist, handleValidations, chemistController.allProducts);
// router.get('/getCategories', validations.jwtValidationChemist, chemistController.getCategories);
// router.get('/getCategoryProducts/:categoryId', validations.jwtValidationChemist, chemistController.getCategoryProducts);
router.get('/getCategories', chemistController.getCategories);
router.get('/getCategoryProducts/:categoryId', chemistController.getCategoryProducts);
router.get('/allProducts', chemistController.allProducts);
router.get('/getProduct/:productId', chemistController.getProduct);
router.get("/getSingleProduct/:productName", chemistController.getSingleProduct);


// verify Mobile and Email
router.get('/verify-unique', chemistController.verifyUnique);

// otp 
router.get('/sendOTP', chemistController.sendOTP);

// mrcode checking 
router.get('/checkMrcode/:mrcode', chemistController.checkMrcode);

module.exports = router;
