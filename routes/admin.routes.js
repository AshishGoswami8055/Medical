const express = require('express');
const routes = express.Router();
const adminController = require("../controller/admin.controller");
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');
const uploadImage = require('../middlewares/upload');
const uploadImages = require('../middlewares/uploadToCloudinary');

routes.post('/registerAdmin', validations.registerAdmin, handleValidations, adminController.registerAdmin);
routes.post('/loginAdmin', validations.loginAdmin, handleValidations, adminController.loginAdmin);

routes.get("/adminProfile", validations.jwtValidation, adminController.adminProfile);

routes.post('/changePasswordAdmin', validations.jwtValidation, adminController.changePasswordAdmin);

routes.post('/registerMR', validations.jwtValidation, validations.registerMR, handleValidations, adminController.registerMR);

routes.post('/registerStockist', validations.jwtValidation, validations.registerStockist, handleValidations, adminController.registerStockist);

routes.post('/registerSalesman', validations.jwtValidation, validations.registerSalesman, handleValidations, adminController.registerSalesman);

// categories routes
routes.post(
  '/addCategory',
  uploadImages([{ name: 'categoryImage', maxCount: 1 }]),
  validations.jwtValidation,
  validations.addCategory,
  handleValidations,
  adminController.addCategory
);
routes.delete('/deleteCategory/:categoryId',validations.jwtValidation, adminController.deleteCategory);
routes.get('/getAllCategories', validations.jwtValidation, adminController.getAllCategories);
routes.put(
  '/updateCategory/:categoryId',
  validations.jwtValidation,
  uploadImages([{ name: 'categoryImage', maxCount: 1 }]),
  adminController.updateCategory
);


routes.patch('/approve-chemist/:chemistId', validations.jwtValidation, adminController.approveChemist);

routes.get("/getAllChemist", validations.jwtValidation, adminController.getAllChemist);
routes.get("/getAllStockist", validations.jwtValidation, adminController.getAllStockist);
routes.get("/getAllSalesman", validations.jwtValidation, adminController.getAllSalesman);
routes.get("/getAllMr", validations.jwtValidation, adminController.getAllMr);
routes.get("/getAllOrders", validations.jwtValidation, adminController.getAllOrders);

// product routes

routes.post(
  '/addProduct',
  validations.jwtValidation,
  uploadImages([
    { name: 'productImage', maxCount: 1 },
    { name: 'boxImage', maxCount: 1 },
    { name: 'relatedImage', maxCount: 1 },
  ]),
  adminController.addProduct
);

routes.delete(
  '/deleteProduct/:productId',
  validations.jwtValidation,
  adminController.deleteProduct
);

routes.put(
  '/updateProduct/:id',
  validations.jwtValidation,
  uploadImages([
    { name: 'productImage', maxCount: 1 },
    { name: 'boxImage', maxCount: 1 },
    { name: 'relatedImage', maxCount: 1 },
  ]),
  adminController.updateProduct
);


routes.get('/getAllProducts', validations.jwtValidation, adminController.getAllProducts);
module.exports = routes;