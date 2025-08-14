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

// Hook to auto-generate random unique 4-digit mrCode
mrSchema.pre('save', async function (next) {
  if (!this.mrCode) {
    let unique = false;
    let randomCode;

    while (!unique) {
      randomCode = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit number
      const existing = await mongoose.model('MR').findOne({ mrCode: randomCode });
      if (!existing) {
        unique = true;
      }
    }

    this.mrCode = randomCode;
  }
  next();
});

module.exports = mongoose.model('MR', mrSchema);
