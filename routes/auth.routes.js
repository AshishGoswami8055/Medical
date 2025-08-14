const express = require("express");
const passport = require("passport");
const router = express.Router();
router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.user);

  res.status(200).json({
    message: 'Token valid',
  });
});
router.get(
  '/verifyTokenChemist',
  passport.authenticate('chemist-jwt', { session: false }),
  (req, res) => {
    console.log(req.user);
    res.status(200).json({ success: true, message: 'Token is valid' })
  }
)
router.get(
  '/verifyTokenMR',
  passport.authenticate('mr-jwt', { session: false }),
  (req, res) => {
    console.log('Token is valid',req.user);
    res.status(200).json({ success: true, message: 'Token is valid' })
  }
)


module.exports = router;