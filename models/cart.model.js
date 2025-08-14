const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  chemistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemist', required: true },
  freeQty: {
    type: String,
    required: true,
    default: '0',
  },
  // free avse freeQty/hs/0
  // 👇 Track who added the product (MR or Chemist)
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'orderedByModel',
  },
  orderedByModel: {
    type: String,
    required: true,
    enum: ['MR', 'Chemist'],
  },

  status: {
    type: String,
    enum: ['Pending', 'Ordered'],
    default: 'Pending',
  }

}, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);
