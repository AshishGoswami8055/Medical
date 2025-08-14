const orderModel = require("../models/order.model");
const Stockist = require("../models/stockist.model");
const mail = require("../services/mail");
const jwt = require("jsonwebtoken");

module.exports.loginStockist = async (req, res) => {
    try {
        console.log("Login Stockist:", req.body);
        let stockistData = req.user.toObject(); // assuming req.user is set during validation

        let token = jwt.sign({ id: stockistData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "Stockist logged in successfully.",
            data: { ...stockistData, token },
            success: true
        });
    } catch (error) {
        console.error("Error logging in Stockist:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

module.exports.changeOrderStatus = async (req, res) => {
try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    

    // Ensure only stockists can update the status
    if (userRole !== 'Stockist') {
      return res.status(403).json({ success: false, message: 'Only stockists can change order status' });
    }

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Optional: ensure the stockist is the one assigned to this order
    if (order.stockistId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Order already ${order.status}` });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order ${status.toLowerCase()} successfully`,
      order,
    });
  } catch (error) {
    console.error('Change Order Status Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}