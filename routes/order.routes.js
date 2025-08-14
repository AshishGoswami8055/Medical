const { placeOrder, getUserOrders, getUserOrdersByDateRange } = require('../controller/order.controller');
const express = require('express');
const authentication = require('../middlewares/authentication');
const router = express.Router();
router.post('/place', authentication, placeOrder);
router.get('/my-orders', authentication, getUserOrders);

// data by date range 
router.get('/getUserOrdersByDateRange', authentication, getUserOrdersByDateRange);

module.exports = router;