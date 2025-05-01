const mongoose = require('mongoose');

const mrSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: true },
  mrCode: { type: String, unique: true }
}, { timestamps: true });

// Hook to auto-generate sequential mrCode
mrSchema.pre('save', async function (next) {
  if (!this.mrCode) {
    const lastMr = await mongoose.model('MR').findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastMr?.mrCode) {
      const lastNumber = parseInt(lastMr.mrCode.replace('MR', ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    this.mrCode = `MR${String(nextNumber).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MR', mrSchema);
