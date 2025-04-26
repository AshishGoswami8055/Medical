const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const stockistSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stockistCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8).toUpperCase() },
    status: { type: String, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Stockist', stockistSchema);
