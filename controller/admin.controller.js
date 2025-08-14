const admin = require("../models/admin.model");
const Category = require("../models/category.model");
const MR = require("../models/MR.model");
const Stockist = require("../models/stockist.model");
const Salesman = require("../models/saleman.model");
const Chemist = require("../models/chemist.model");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mail = require("../services/mail");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const deleteFromCloudinary = require("../middlewares/deleteFromCloudinary");
const cloudinary = require("../config/cloudinary")

const generatePassword = () => {
  return crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
};

//register and login for Admin
module.exports.registerAdmin = async (req, res) => {
  try {
    console.log("Registering admin:", req.body);
    let { name, email, phone, password } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 10);
    let adminData = await admin.create({ name, email, phone, password: encryptedPassword });
    let adminResponse = adminData.toObject();
    delete adminResponse.password; // Remove password from response
    return res.status(200).json({ message: "Admin registered successfully.", data: adminResponse });
  } catch (error) {
    console.error("Error registering admin:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
module.exports.loginAdmin = async (req, res) => {
  try {
    console.log("Logging in admin:", req.body);
    let adminData = req.isAdminExist.toObject();
    let token = jwt.sign({ id: adminData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ message: "Admin logged in successfully.", data: { ...adminData, token } });
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports.adminProfile = async (req, res) => {
  try {
    console.log("Fetching admin profile:", req.user);
    let adminData = req.user.toObject();
    delete adminData.password; // Remove password from response
    return res.status(200).json({ message: "Admin profile fetched successfully.", data: adminData });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports.changePasswordAdmin = async (req, res) => {
  try {
    console.log(req.body);
    let { oldPassword, newPassword } = req.body;
    let adminData = req.user.toObject();
    let isMatch = await bcrypt.compare(oldPassword, adminData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    let encryptedPassword = await bcrypt.hash(newPassword, 10);
    await admin.updateOne({ _id: adminData._id }, { password: encryptedPassword });
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// category  
exports.addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const imageFile = req.files?.categoryImage?.[0];

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Category image is required' });
    }

    const newCategory = new Category({
      categoryName,
      categoryImage: {
        url: imageFile.path,
        public_id: imageFile.filename // `filename` holds the public_id in Cloudinary
      }
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Add Category Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    let categoryList = await Category.find();
    return res.status(200).json({ message: "Category list fetched successfully.", data: categoryList, totalCategories: categoryList.length, success: true });
  } catch (error) {
    console.error("Error fetching Category list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryName } = req.body;
    const imageFile = req.files?.categoryImage?.[0];

    // Find existing category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Update name if provided
    if (categoryName) {
      category.categoryName = categoryName;
    }

    // Replace image if a new one is uploaded
    if (imageFile) {
      // Delete old image from Cloudinary
      if (category.categoryImage?.public_id) {
        await deleteFromCloudinary(category.categoryImage.public_id);
      }

      // Set new image
      category.categoryImage = {
        url: imageFile.path,
        public_id: imageFile.filename,
      };
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.deleteCategory = async (req, res) => {
    try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete image from Cloudinary
    if (category.categoryImage?.public_id) {
      await deleteFromCloudinary(category.categoryImage.public_id);
    }

    // Delete category from DB
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: 'Category and its image deleted successfully',
    });
  } catch (err) {
    console.error('Delete Category Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

//register for MR
module.exports.registerMR = async (req, res) => {
  try {
    let password = generatePassword();
    let { name, city, mobile, email } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 10);
    let mrData = {
      name,
      city,
      mobile,
      email,
      password: encryptedPassword
    }
    let MRData = await MR.create(mrData);

    let message = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Medicine Management" style="width: 80px; margin-bottom: 20px;" />
              <h2 style="color: #28a745; margin-bottom: 10px;">Welcome to Medicine Management!</h2>
              <p style="color: #5f5f5f; font-size: 16px;">Your MR account has been successfully created.</p>
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
    return res.status(200).json({ message: "MR registered successfully.", data: MRData, success: true, emailSent: mailToUser.success });
  } catch (error) {
    console.error("Error registering MR:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

//register for Stockist
module.exports.registerStockist = async (req, res) => {
  try {
    let password = generatePassword();
    let { shopName, ownerName, address, city, pincode, mobile, email } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 10);
    let stockistData = {
      shopName,
      ownerName,
      address,
      city,
      pincode,
      mobile,
      email,
      password: encryptedPassword
    }
    let stockistDATA = await Stockist.create(stockistData);

    let message = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Medicine Management" style="width: 80px; margin-bottom: 20px;" />
              <h2 style="color: #28a745; margin-bottom: 10px;">Welcome to Medicine Management!</h2>
              <p style="color: #5f5f5f; font-size: 16px;">Your Stockist account has been successfully created.</p>
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
    return res.status(200).json({ message: "Stockist registered successfully.", data: stockistDATA, success: true, emailSent: mailToUser.success });
  } catch (error) {
    console.error("Error registering Stockist:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

//register for Salesman
module.exports.registerSalesman = async (req, res) => {
  try {
    let password = generatePassword();
    let { stockistCode, name, mobile, email } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 10);
    let salesmanData = {
      stockistCode,
      name,
      mobile,
      email,
      password: encryptedPassword
    }
    let salesmanDATA = await Salesman.create(salesmanData);

    let message = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Medicine Management" style="width: 80px; margin-bottom: 20px;" />
              <h2 style="color: #28a745; margin-bottom: 10px;">Welcome to Medicine Management!</h2>
              <p style="color: #5f5f5f; font-size: 16px;">Your Salesman account has been successfully created.</p>
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
    return res.status(200).json({ message: "Salesman registered successfully.", data: salesmanDATA, success: true, emailSent: mailToUser.success });
  } catch (error) {
    console.error("Error registering Salesman:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// verifying chemist account 
module.exports.approveChemist = async (req, res) => {
  try {
    const { chemistId } = req.params;

    const chemist = await Chemist.findById(chemistId);
    if (!chemist) {
      return res.status(404).json({ success: false, message: "Chemist not found." });
    }

    if (chemist.status) {
      return res.status(400).json({ success: false, message: "Chemist is already approved." });
    }

    chemist.status = true;
    await chemist.save();

    return res.status(200).json({ success: true, message: "Chemist approved successfully." });
  } catch (error) {
    console.error("Error approving chemist:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


// getting all chemist 
module.exports.getAllChemist = async (req, res) => {
  try {
    let chemistList = await Chemist.find();
    return res.status(200).json({ message: "Chemist list fetched successfully.", data: chemistList });
  } catch (error) {
    console.error("Error fetching chemist list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// getting all stockist
module.exports.getAllStockist = async (req, res) => {
  try {
    let stockistList = await Stockist.find();
    return res.status(200).json({ message: "Stockist list fetched successfully.", data: stockistList });
  } catch (error) {
    console.error("Error fetching stockist list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// getting all salesman
module.exports.getAllSalesman = async (req, res) => {
  try {
    let salesmanList = await Salesman.find();
    return res.status(200).json({ message: "Salesman list fetched successfully.", data: salesmanList });
  } catch (error) {
    console.error("Error fetching salesman list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// getting all MR
module.exports.getAllMr = async (req, res) => {
  try {
    let MRList = await MR.find();
    return res.status(200).json({ message: "MR list fetched successfully.", data: MRList });
  } catch (error) {
    console.error("Error fetching MR list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// getting all orders
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('chemistId')                 // populate full chemist details
      .populate('stockistId')                // populate full stockist details
      .populate('products.productId')        // populate full product details
      .lean()                                // for faster response and manual manipulation

    // Manually populate orderedBy based on dynamic model (Chemist or MR)
    console.log("Orders fetched:", orders);
    
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        let orderedByData = null

        if (order.orderedByModel === 'Chemist') {
          orderedByData = await Chemist.findById(order.orderedBy).lean()
        } else if (order.orderedByModel === 'MR') {
          orderedByData = await MR.findById(order.orderedBy).lean()
        }

        return {
          ...order,
          orderedBy: orderedByData, // Replace ID with actual data
        }
      })
    )

    return res.status(200).json({
      message: 'Order list fetched successfully.',
      data: populatedOrders,
      total: populatedOrders.length,
    })
  } catch (error) {
    console.error('Error fetching order list:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// register product

module.exports.addProduct = async (req, res) => {
   try {
    const {
      productName,
      composition,
      description,
      uses,
      mrp,
      rate,
      schemeQuantity,
      schemeFree,
      categoriesID,
    } = req.body;

    // ✅ Extract image info from req.files
    const productImage = {
      url: req.files?.productImage?.[0]?.path,
      public_id: req.files?.productImage?.[0]?.filename,
    };
    const boxImage = {
      url: req.files?.boxImage?.[0]?.path,
      public_id: req.files?.boxImage?.[0]?.filename,
    };
    const relatedImage = {
      url: req.files?.relatedImage?.[0]?.path,
      public_id: req.files?.relatedImage?.[0]?.filename,
    };

    // ✅ Check image presence
    if (!productImage.url || !boxImage.url || !relatedImage.url) {
      return res.status(400).json({ success: false, message: 'All three images are required' });
    }

    // ✅ Create new product
    const newProduct = new Product({
      productName,
      composition,
      productImage,
      boxImage,
      relatedImage,
      description,
      uses,
      mrp,
      rate,
      scheme: {
        schemeQuantity,
        schemeFree,
      },
      categoriesID: Array.isArray(categoriesID) ? categoriesID : [categoriesID],
    });

    await newProduct.save();

    return res.status(201).json({ success: true, message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Add Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


module.exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete images from Cloudinary
    const publicIds = [
      product.productImage.public_id,
      product.boxImage.public_id,
      product.relatedImage.public_id,
    ];

    for (const id of publicIds) {
      await cloudinary.uploader.destroy(id);
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports.updateProduct = async (req, res) => {
   try {
    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      productName,
      composition,
      description,
      uses,
      hs,
      mrp,
      rate,
      schemeQuantity,
      schemeFree,
      categoriesID,
    } = req.body;

    // Update fields
    product.productName = productName || product.productName;
    product.composition = composition || product.composition;
    product.description = description || product.description;
    product.uses = uses || product.uses;
    product.hs = hs === 'true' || hs === true || false;
    product.mrp = mrp || product.mrp;
    product.rate = rate || product.rate;
    product.scheme.schemeQuantity = schemeQuantity || product.scheme.schemeQuantity;
    product.scheme.schemeFree = schemeFree || product.scheme.schemeFree;
    product.categoriesID = categoriesID
      ? Array.isArray(categoriesID) ? categoriesID : [categoriesID]
      : product.categoriesID;

    // 🔁 Optional image replacements
    const imageFields = ['productImage', 'boxImage', 'relatedImage'];

    for (const field of imageFields) {
      if (req.files?.[field]?.[0]) {
        // Delete old image
        if (product[field]?.public_id) {
          await cloudinary.uploader.destroy(product[field].public_id);
        }

        // Add new image
        product[field] = {
          url: req.files[field][0].path,
          public_id: req.files[field][0].filename,
        };
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports.getAllProducts = async (req, res) => {
  try {
    let productList = await Product.find().populate('categoriesID', 'categoryName'); // Only populate categoryName
    return res.status(200).json({ message: "Product list fetched successfully.", data: productList });
  } catch (error) {
    console.error("Error fetching product list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
