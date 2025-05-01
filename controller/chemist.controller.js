const chemist = require("../models/chemist.model");
const mail = require("../services/mail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports.registerChemist = async (req, res) => {
    try {
        let { shopName, ownerName, address, city, pincode, mobile, email, password, gstOrPan, drugLicenseNumber, refCode } = req.body;
        let drugLicenseImage;
        if(req.files && req.files.drugLicenseImage){ // if user provide image else default url will be store
            drugLicenseImage = "/uploads/drugLicense/"+req.files.drugLicenseImage[0].filename;
        }
        let encryptedPassword = await bcrypt.hash(password, 10);
        let data = {
            shopName: shopName,
            ownerName: ownerName,
            address: address,
            city: city,
            pincode: pincode,
            mobile: mobile,
            email: email,
            password: encryptedPassword,
            gstOrPan: gstOrPan,
            drugLicenseNumber: drugLicenseNumber,
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
        console.error("Error registering chemist:", error);
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