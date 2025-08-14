const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Stockist = require('../models/stockist.model');
const Chemist = require('../models/chemist.model');
const Product = require('../models/product.model');
const MR = require('../models/MR.model');

exports.placeOrder = async (req, res) => {
  try {
    const { chemistId, stockistId, totalAmount } = req.body;
    const orderedBy = req.user.id;
    const orderedByModel = req.user.role === 'MR' ? 'MR' : 'Chemist';

    if (!chemistId || !stockistId) {
      return res.status(400).json({
        success: false,
        message: !chemistId ? 'Chemist ID is required' : 'Stockist ID is required',
      });
    }

    // ✅ Fetch Chemist, Stockist, and MR/Chemist (orderedBy) in parallel
    const [chemist, stockist, orderedByUser] = await Promise.all([
      Chemist.findById(chemistId).select('shopName refCode').lean(),
      Stockist.findById(stockistId).select('shopName mobile').lean(),
      orderedByModel === 'MR'
        ? MR.findById(orderedBy).select('name mrCode').lean()
        : Chemist.findById(orderedBy).select('shopName').lean(),
    ]);

    if (!chemist || !stockist || !orderedByUser) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Chemist, Stockist or User',
      });
    }

    // ✅ Determine orderType
    let orderType = 'SELF';
    if (orderedByModel === 'MR') {
      orderType = chemist.refCode === orderedByUser.mrCode ? 'MMR' : 'OMR';
    }

    // ✅ Get Cart Items
    const cartItems = await Cart.find({
      chemistId,
      orderedBy,
      orderedByModel,
      status: 'Pending',
    }).select('productId quantity freeQty').lean();

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No pending cart items',
      });
    }

    // ✅ Fetch Product Details
    const productIds = cartItems.map(item => item.productId);
    const productDocs = await Product.find({ _id: { $in: productIds } })
      .select('_id productName rate')
      .lean();

    const products = cartItems.map(item => {
      const matchedProduct = productDocs.find(
        prod => prod._id.toString() === item.productId.toString()
      );

      return {
        productId: item.productId,
        productName: matchedProduct?.productName || 'Unknown',
        rate: matchedProduct?.rate || 0,
        quantity: item.quantity,
        freeQty: item.freeQty,
      };
    });

    // ✅ Construct Order Object
    const newOrderData = {
      chemistId,
      chemistName: chemist.shopName,
      stockistId,
      stockistName: stockist.shopName,
      stockistNumber: stockist.mobile,
      orderedBy,
      orderByName: orderedByUser.shopName || orderedByUser.name,
      orderedByModel,
      orderType,
      products,
      totalItems: products.length,
      totalAmount,
      status: 'Pending',
    };

    // ✅ Save Order
    const newOrder = await new Order(newOrderData).save();

    // ✅ Clear Cart
    await Cart.deleteMany({
      chemistId,
      orderedBy,
      orderedByModel,
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });

  } catch (error) {
    console.error('Place Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};




exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role === 'MR' ? 'MR' : 'Chemist';

    const orders = await Order.find({
      orderedBy: userId,
      orderedByModel: userRole
    })
      .sort({ createdAt: -1 }) // newest first
      .populate('chemistId') // ✅ populate all fields from Chemist
      .populate('stockistId') // ✅ populate all fields from Stockist
      .populate('products.productId'); // ✅ populate all fields from Product

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserOrdersByDateRange = async (req, res) => {
  try {
    console.log(req.query);
    const userId = req.user.id;
    const userRole = req.user.role === 'MR' ? 'MR' : 'Chemist';


    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end time to 23:59:59 to include entire day
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      orderedBy: userId,
      orderedByModel: userRole,
      createdAt: { $gte: start, $lte: end }
    })
      .sort({ createdAt: -1 })
      .populate('chemistId')
      .populate('stockistId')
      .populate('products.productId');

    res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


