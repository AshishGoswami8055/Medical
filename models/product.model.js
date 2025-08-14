const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  composition: { type: String, required: false, trim: true }, // baki
  productImage: { type: imageSchema, required: true },
  boxImage: { type: imageSchema, required: true },
  relatedImage: { type: imageSchema, required: true },

  description: { type: String, required: true, trim: true },
  uses: { type: String, required: true, trim: true },
  mrp: { type: Number, required: true },
  rate: { type: Number, required: true },

  scheme: {
    schemeQuantity: { type: Number, required: true },
    schemeFree: { type: Number, required: true },
  },

  categoriesID: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  ],

  status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);
