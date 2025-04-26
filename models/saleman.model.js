const mongoose = require('mongoose');

const salesmanSchema = new mongoose.Schema({
    stockistCode: { type: String, required: true }, // FK reference to Stockist
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Salesman', salesmanSchema);
