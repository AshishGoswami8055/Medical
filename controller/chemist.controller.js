const { default: mongoose } = require("mongoose");
const Category = require("../models/category.model");
const MR = require("../models/MR.model");
const chemist = require("../models/chemist.model");
const productModel = require("../models/product.model");
const product = require("../models/product.model");
const mail = require("../services/mail");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

module.exports.registerChemist = async (req, res) => {
  try {
    let { shopName, ownerName, pincode, area, city, district, state, address, mobile, email, password, gstOrPan, drugLicenseNumber1, drugLicenseNumber2, refCode } = req.body;
    let drugLicenseImage;
    if (req.files && req.files.drugLicenseImage) { // if user provide image else default url will be store
      drugLicenseImage = "/uploads/drugLicense/" + req.files.drugLicenseImage[0].filename;
    }
    let encryptedPassword = await bcrypt.hash(password, 10);
    let data = {
      shopName: shopName,
      ownerName: ownerName,
      pincode: pincode,
      area: area,
      city: city,
      district: district,
      state: state,
      address: address,
      mobile: mobile,
      email: email,
      password: encryptedPassword,
      gstOrPan: gstOrPan,
      drugLicenseNumber1: drugLicenseNumber1,
      drugLicenseNumber2: drugLicenseNumber2,
      drugLicenseImage: drugLicenseImage,
      refCode: refCode,
    };

    let chemistData = await chemist.create(data);
    let message = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Medicine Management" style="width: 80px; margin-bottom: 20px;" />
              <h2 style="color: #28a745; margin-bottom: 10px;">Welcome to Medicine Management!</h2>
              <p style="color: #5f5f5f; font-size: 16px;">Your Chemist account has been successfully created.</p>
            </div>
        
            <div style="margin-top: 30px;">
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px;">Your Login Credentials</h3>
              <table style="width: 100%; font-size: 15px; color: #5f5f5f;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Username:</strong></td>
                  <td style="padding: 8px 0;">${mobile}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Password:</strong></td>
                  <td style="padding: 8px 0;">${password}</td>
                </tr>
              </table>
        
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-login-page.com" style="background-color: #28a745; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login Now</a>
              </div>
        
              <p style="color: #777777; font-size: 14px;">
                Please change your password after your first login for better security.<br/><br/>
                If you face any issues, feel free to contact our support team anytime.
              </p>
            </div>
        
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        
            <div style="text-align: center; font-size: 12px; color: #aaaaaa;">
              &copy; ${new Date().getFullYear()} Medicine Management. All rights reserved.
            </div>
          </div>
        </div>
        `;
    let mailToUser = await mail(email, "Account Registered", message);
    return res.status(200).json({ message: "Chemist registered successfully admin will verify this account after this you will be able to login.", data: chemistData, success: true, emailSend: mailToUser.success });
  } catch (error) {
    console.log("Error registering chemist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
module.exports.profile = async (req, res) => {
  try {
    let chemistData = req.chemistUser.toObject();
    return res.status(200).json({ message: "Chemist profile fetched successfully.", data: chemistData, success: true });
  } catch (error) {
    console.error("Error fetching chemist profile:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
module.exports.loginChemist = async (req, res) => {
  try {
    console.log("Login chemist:", req.body);
    let chemistData = req.chemistUser.toObject();
    let token = jwt.sign({ id: chemistData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ message: "Chemist logged in successfully.", data: { ...chemistData, token }, success: true });
  } catch (error) {
    console.error("Error logging in chemist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
module.exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current Password and newPassword are required.", success: false });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.chemistUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Current Password.", success: false });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    req.chemistUser.password = hashedNewPassword;
    await req.chemistUser.save();

    return res.status(200).json({ message: "Password changed successfully.", success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports.allProducts = async (req, res) => {
  try {
    let productData = await product.find();
    return res.status(200).json({ message: "Chemist logged in successfully.", data: productData, success: true });
  } catch (error) {
    console.error("Error logging in chemist:", error);
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

    const products = await productModel
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

module.exports.getCategories = async (req, res) => {
  try {
    let categoryList = await Category.find();
    return res.status(200).json({ message: "Category list fetched successfully.", data: categoryList, totalCategories: categoryList.length, success: true });
  } catch (error) {
    console.error("Error fetching Category list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

exports.getCategoryProducts = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
      });
    }

    const products = await product.aggregate([
      {
        $match: {
          categoriesID: new mongoose.Types.ObjectId(categoryId),
        },
      },
    ]);

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found for this category.",
        success: false,
      });
    }

    return res.status(200).json({
      message: `Products fetched for category ID: ${categoryId}`,
      data: products,
      count: products.length,
      success: true,
    });
  } catch (err) {
    console.error("Error fetching category products:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.checkMrcode = async (req, res) => {
  const mrcode = req.params.mrcode;
  if (!mrcode) {
    return res.status(400).json({ message: "MR Code is required", success: false });
  }

  try {
    const name = await MR.findOne({ mrCode: mrcode }).select("name -_id").lean();
    if (!name) {
      return res.status(404).json({ message: "MR Code not found", success: false });
    }

    return res.status(200).json({ message: "MR Code is valid", data: name.name, success: true });
  } catch (error) {
    console.error("Error checking MR Code:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
  