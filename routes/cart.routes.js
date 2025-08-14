// routes/cart.js
const express = require('express');
const router = express.Router();
const { addToCart, isProductInCart, getCartItems, getStockist, removeFromCart } = require('../controller/cart.Controller.js');

// Auth middleware that sets `req.user.id` and `req.user.role`
const authentication = require('../middlewares/authentication.js');

router.post('/addToCart', authentication, addToCart);
router.get('/isProductInCart/:productId', authentication, isProductInCart);
router.get('/getCartItems/:chemistId', authentication, getCartItems);
router.get('/getStockist/:chemistId', authentication, getStockist);

router.delete('/removeFromCart/:id', authentication, removeFromCart);
module.exports = router;
