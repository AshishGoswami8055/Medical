// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Chemist = require('../models/chemist.model');
const MR = require('../models/MR.model');
const stockistModel = require('../models/stockist.model');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const chemist = await Chemist.findById(decoded.id);
    if (chemist) {
      req.user = { id: chemist._id, role: 'Chemist' };
      return next();
    }

    const mr = await MR.findById(decoded.id);
    if (mr) {
      req.user = { id: mr._id, role: 'MR' };
      return next();
    }

    const stockist = await stockistModel.findById(decoded.id);
    if (stockist) {
      req.user = { id: stockist._id, role: 'Stockist' };
      return next();
    }

    return res.status(401).json({ error: 'Invalid token user' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
