const mongoose = require('mongoose');
const Counter = require('./Counter.model');

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: Number,
    unique: true
  },
  // chemist
  chemistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chemist',
    required: true,
  },
  chemistName: {
    type: String,
    required: true,
  },
  // stockist 
  stockistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stockist',
    required: true,
  },
  stockistName: {
    type: String,
    required: true,
  },
  stockistNumber: {
    type: String,
    required: true,
  },
  // order by
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'orderedByModel',
  },
  orderByName: {
    type: String,
    required: true,
  },
  orderedByModel: {
    type: String,
    required: true,
    enum: ['Chemist', 'MR'],
  },
  orderType: {
    type: String,
    required: true,
    enum: ['SELF', 'MMR', 'OMR'],
  },
  // products 
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
      productName: { type: String, required: true },
      rate: { type: Number, required: true },
      freeQty: { type: String, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  totalItems: Number,
}, { timestamps: true });

// 🔁 Auto-increment orderNo before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'orderNo' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderNo = counter.seq;
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);
