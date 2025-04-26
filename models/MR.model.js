const mongoose = require('mongoose');

const mrSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MR', mrSchema);
