const Cart = require('../models/cart.model');
const chemistModel = require('../models/chemist.model');
const stockistModel = require('../models/stockist.model');

exports.addToCart = async (req, res) => {
  try {

    const { productId, quantity, chemistId } = req.body;

    console.log("Missing required fields:", { productId, quantity, chemistId });
    if (!productId || !quantity || !chemistId) {
      console.log("Missing required fields:", { productId, quantity, chemistId });
      
      return res.status(400).json({ success: false, message: 'Product ID, quantity, and chemist ID are required' });
    }

    const orderedBy = req.user.id;
    const orderedByModel = req.user.role; // Should be either 'MR' or 'Chemist'
    console.log("Ordered By:", orderedBy, "Model:", orderedByModel);

    const getChemistId = (chemist) => {
      return typeof chemist === 'object' && chemist !== null ? chemist._id.toString() : chemist.toString();
    };
    // If a Chemist is trying to add for another Chemist, block it
    if (orderedByModel === 'Chemist' && orderedBy.toString() !== getChemistId(chemistId)) {
      console.log("Unauthorized attempt by Chemist to add to another Chemist's cart");
      console.log("Chemist ID:", chemistId, "Ordered By:", orderedBy);

      return res.status(403).json({ success: false, message: 'Chemists can only add to their own cart' });
    }


    const existingCart = await Cart.findOne({
      productId,
      chemistId,
      orderedBy,
      orderedByModel,
      status: 'Pending'
    });

    if (existingCart) {
      // existingCart.quantity = Number(existingCart.quantity) + Number(quantity);
      existingCart.quantity = Number(quantity);
      existingCart.freeQty = req.body.freeQty || 0; // Update free quantity if provided
      await existingCart.save();
      return res.status(200).json({ success: true, message: 'Updated cart', cartItem: existingCart });
    }

    const newCart = new Cart({
      productId,
      quantity: Number(quantity),
      freeQty: req.body.freeQty || 0,
      chemistId,
      orderedBy,
      orderedByModel
    });

    await newCart.save();

    return res.status(200).json({ success: true, message: 'Added to cart', cartItem: newCart });
  } catch (error) {
    console.error('Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.isProductInCart = async (req, res) => {
  const { productId } = req.params;
  const { chemistId } = req.query;
  const role = req.user.role;
  const userId = req.user.id;

  try {
    let query = { productId, chemistId };

    if (role === 'MR') {
      query.orderedBy = userId; // only check items added by this MR
      query.orderedByModel = 'MR'; // ensure it's an MR's cart
    } else if (role === 'Chemist') {
      query.orderedBy = userId; // exclude MR-added items
      query.orderedByModel = 'Chemist'; // ensure it's a Chemist's cart
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }


    const cartItem = await Cart.findOne(query);

    return res.status(200).json({
      success: true,
      isInCart: !!cartItem,
      cartData: cartItem || null
    });
  } catch (err) {
    console.error('Error checking product in cart:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCartItems = async (req, res) => {
  const { chemistId } = req.params;
  const role = req.user.role;
  const userId = req.user.id;

  try {
    if (!chemistId) {
      return res.status(400).json({ success: false, message: 'Chemist ID is required' });
    }

    let query = { chemistId };


    if (role === 'MR') {
      query.orderedBy = userId; // Only orders made by this MR for that chemist
      query.orderedByModel = 'MR'; // Ensure it's an MR's cart
    } else if (role === 'Chemist') {
      query.orderedBy = userId; // Only orders made by the Chemist, not by any MR
      query.orderedByModel = 'Chemist'; // Ensure it's a Chemist's cart
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    console.log("Fetching cart items with query:", query);
    const cartItems = await Cart.find(query).populate('productId').populate('chemistId').sort({ createdAt: -1 });
    console.log("Cart items found:", cartItems);

    return res.status(200).json({
      success: true,
      cartItems,
      count: cartItems.length,
    });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStockist = async (req, res) => {
  const { chemistId } = req.params;
  try {
    // Step 1: Get the chemist by ID
    const chemist = await chemistModel.findById(chemistId);

    if (!chemist) {
      return res.status(404).json({
        success: false,
        message: 'Chemist not found',
      });
    }

    console.log("Chemist found:", chemist);

    // Step 2: Extract the city
    const chemistCity = chemist.district;

    // Step 3: Find stockists in the same city
    const stockists = await stockistModel.find({
      city: new RegExp(`^${chemistCity}$`, 'i') // case-insensitive match
    });

    // Step 4: Return the result
    return res.status(200).json({
      success: true,
      data: stockists,
      count: stockists.length,
    });

  } catch (err) {
    console.error('Error fetching stockists:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    console.log("Removing item from cart with ID:", req.params.id);
    
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cart item not found' });
    res.status(200).json({ message: 'Item removed from cart', deleted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete cart item' });
  }
};
