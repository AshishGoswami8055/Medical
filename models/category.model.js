const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  categoryImage: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  status: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

const Category = mongoose.model('category', categorySchema);
module.exports = Category;
