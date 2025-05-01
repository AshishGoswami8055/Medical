const Stockist = require("../models/stockist.model");
const mail = require("../services/mail");
const jwt = require("jsonwebtoken");

module.exports.loginStockist = async (req, res) => {
    try {
        console.log("Login Stockist:", req.body);
        let stockistData = req.user.toObject(); // assuming req.user is set during validation

        let token = jwt.sign({ id: stockistData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "Stockist logged in successfully.",
            data: { ...stockistData, token },
            success: true
        });
    } catch (error) {
        console.error("Error logging in Stockist:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
