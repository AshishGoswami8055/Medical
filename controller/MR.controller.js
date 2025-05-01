const MR = require("../models/MR.model");
const mail = require("../services/mail");
const jwt = require("jsonwebtoken");

module.exports.loginMR = async (req, res) => {
    try {
        console.log("Login MR:", req.body);
        let mrData = req.user.toObject(); // assuming you set req.user in validation
        let token = jwt.sign({ id: mrData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "MR logged in successfully.",
            data: { ...mrData, token },
            success: true
        });
    } catch (error) {
        console.error("Error logging in MR:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
