const admin = require("../models/admin.model");
const MR = require("../models/MR.model");
const Stockist = require("../models/stockist.model");
const Salesman = require("../models/saleman.model");
const Chemist = require("../models/chemist.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mail = require("../services/mail");

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