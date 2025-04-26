const express = require('express');
const routes = express.Router();
const adminController = require("../controller/admin.controller");
const validations = require('../middlewares/validations');
const handleValidations = require('../middlewares/handleValidations');

routes.post('/registerAdmin', validations.registerAdmin, handleValidations, adminController.registerAdmin);
routes.post('/loginAdmin', validations.loginAdmin, handleValidations, adminController.loginAdmin);

routes.post('/registerMR', validations.jwtValidation, validations.registerMR, handleValidations, adminController.registerMR);

routes.post('/registerStockist', validations.jwtValidation, validations.registerStockist, handleValidations, adminController.registerStockist);

routes.post('/registerSalesman', validations.jwtValidation, validations.registerSalesman, handleValidations, adminController.registerSalesman);

routes.patch('/approve-chemist/:chemistId', validations.jwtValidation, adminController.approveChemist);

routes.get("/getAllChemist", validations.jwtValidation, adminController.getAllChemist);
routes.get("/getAllStockist", validations.jwtValidation, adminController.getAllStockist);
routes.get("/getAllSalesman", validations.jwtValidation, adminController.getAllSalesman);
routes.get("/getAllMr", validations.jwtValidation, adminController.getAllMr);

module.exports = routes;