const MR = require("../models/MR.model");
const mail = require("../services/mail");
const jwt = require("jsonwebtoken");
const product = require("../models/product.model");
const chemistModel = require("../models/chemist.model");
const Cart = require("../models/cart.model");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

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

module.exports.profile = async (req, res) => {
    try {
        let mrUserData = req.mrUser.toObject();
        console.log("MR User Data");

        return res.status(200).json({ message: "MR profile fetched successfully.", data: mrUserData, success: true });
    } catch (error) {
        console.error("Error fetching MR profile:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current Password and new Password are required.", success: false });
        }

        const isMatch = await bcrypt.compare(currentPassword, req.mrUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect Current Password.", success: false });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        req.mrUser.password = hashedNewPassword;
        await req.mrUser.save();

        return res.status(200).json({ message: "Password changed successfully.", success: true });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports.allProducts = async (req, res) => {
    try {
        let productData = await product.find();
        return res.status(200).json({ message: "MR fetched all products successfully.", data: productData, success: true });
    } catch (error) {
        console.error("Error fetching products for MR:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports.getProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        let productData = await product.findById(productId).populate('categoriesID', 'categoryName');;
        if (!productData) {
            return res.status(404).json({ message: "Product not found.", success: false });
        }
        return res.status(200).json({ message: "Product fetched successfully.", data: productData, success: true });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

exports.getSingleProduct = async (req, res) => {
    try {
        const keyword = req.params.productName?.trim();

        if (!keyword || keyword.length < 3) {
            return res.status(400).json({
                message: "Search term must be at least 3 characters.",
                success: false
            });
        }

        // Case-insensitive partial match
        const regex = new RegExp(keyword, 'i');

        const products = await product
            .find({ productName: { $regex: regex } })
            .limit(80) // You can adjust limit for performance
            .lean(); // Faster read-only query

        if (!products.length) {
            return res.status(404).json({ message: "No matching products found", success: false });
        }

        return res.status(200).json({
            message: "Matching products fetched successfully",
            data: products,
            count: products.length,
            success: true
        });
    } catch (error) {
        console.error("Error in getMatchingProducts:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};


// module.exports.getChemists = async (req, res) => {
//     try {
//         let chemists = await chemistModel.find({ status: true });
//         return res.status(200).json({
//             message: "Chemists fetched successfully.",
//             data: chemists,
//             success: true
//         });
//     } catch (error) {
//         console.error("Error fetching chemists:", error);
//         return res.status(500).json({ message: "Internal server error." });
//     }
// }

// module.exports.getChemistOfMR = async (req, res) => {
//     try {
//         const mrId = req.user.id // Logged-in MR ID (from JWT middleware)

//         // Step 1: Get the MR's mrCode
//         const mr = await MR.findById(mrId)
//         if (!mr || !mr.mrCode) {
//             return res.status(404).json({ success: false, message: 'MR not found or MR code missing' })
//         }

//         const mrCode = mr.mrCode

//         // Step 2: Find chemists with matching refCode
//         const chemists = await chemistModel.find({ refCode: mrCode })
//         console.log("Chemists for MR:", chemists);

//         return res.status(200).json({
//             success: true,
//             data: chemists,
//             count: chemists.length
//         })
//     } catch (error) {
//         console.error("Error fetching chemists for MR:", error)
//         return res.status(500).json({ success: false, message: "Internal server error." })
//     }
// }

module.exports.getChemists = async (req, res) => {
    try {
        const search = req.query.search;
        console.log("Search term:", search);
        
        if (search.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Minimum 3 characters required to search.",
            });
        }

        const chemists = await chemistModel.find({
            status: true,
            shopName: { $regex: search, $options: 'i' },
        }).limit(10); // ✅ only return 10 closest matches

        return res.status(200).json({
            success: true,
            data: chemists,
        });
    } catch (error) {
        console.error("Error fetching chemists:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

module.exports.getChemistOfMR = async (req, res) => {
    try {
        const search = req.query.search;
        console.log("Search term for MR:", search);

        if (search.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Minimum 3 characters required to search.",
            });
        }

        const mrId = req.user.id;
        const mr = await MR.findById(mrId);
        if (!mr || !mr.mrCode) {
            return res.status(404).json({ success: false, message: 'MR not found or MR code missing' });
        }

        const chemists = await chemistModel.find({
            refCode: mr.mrCode,
            shopName: { $regex: search, $options: 'i' },
        }).limit(10); // ✅ only return 10 closest matches

        return res.status(200).json({
            success: true,
            data: chemists,
        });
    } catch (error) {
        console.error("Error fetching chemists for MR:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports.getChemist = async (req, res) => {
    try {
        const { chemistId } = req.params;
        const chemist = await chemistModel.findById(chemistId);
        if (!chemist) {
            return res.status(404).json({ success: false, message: "Chemist not found." });
        }
        return res.status(200).json({ success: true, data: chemist });
    } catch (error) {
        console.error("Error fetching chemist:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.getMyCart = async (req, res) => {
    try {
        const mrId = req.user.id; // MR ID from JWT
        const cartItems = await Cart.find({ orderedBy: mrId }).populate('productId').populate('chemistId');

        if (!cartItems || cartItems.length === 0) {
            return res.status(404).json({ message: "No items in cart.", count: cartItems.length, success: false });
        }

        return res.status(200).json({
            message: "Cart items fetched successfully.",
            data: cartItems,
            count: cartItems.length,
            success: true
        });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
}

exports.getMyCartCount = async (req, res) => {
    try {
        const mrId = req.user.id; // MR ID from JWT

        const result = await Cart.aggregate([
            {
                $match: {
                    orderedBy: new mongoose.Types.ObjectId(mrId)
                }
            },
            {
                $group: {
                    _id: "$chemistId"
                }
            },
            {
                $count: "uniqueChemists"
            }
        ]);

        const count = result.length > 0 ? result[0].uniqueChemists : 0;

        return res.status(200).json({
            message: "Unique chemist count fetched successfully.",
            count,
            success: true
        });

    } catch (error) {
        console.error("Error fetching unique chemist count:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};
