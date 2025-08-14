const { check } = require('express-validator');
const admin = require('../models/admin.model');
const MR = require('../models/MR.model');
const Stockist = require('../models/stockist.model');
const Salesman = require('../models/saleman.model');
const Chemist = require('../models/chemist.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");

// Helper: check if mobile exists in any collection
const isMobileUnique = async (mobile) => {
    const results = await Promise.all([
        MR.findOne({ mobile }),
        Stockist.findOne({ mobile }),
        Chemist.findOne({ mobile }),
        Salesman.findOne({ mobile }),
        admin.findOne({ phone: mobile })
    ]);

    return results.every((result) => !result);
};

const isEmailUnique = async (email) => {
    const results = await Promise.all([
        MR.findOne({ email }),
        Stockist.findOne({ email }),
        Chemist.findOne({ email }),
        Salesman.findOne({ email }),
        admin.findOne({ email })
    ]);

    // If any of the results is truthy (i.e., user found), return false
    return results.every((result) => !result);
};

const validations = {
    // Admin Registration and Login Validations
    registerAdmin: [
        check("name").notEmpty().withMessage("Name is required")
            .isLength({ min: 3 }).withMessage("Minimum 3 characters required for name"),

        check("email").notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .normalizeEmail()
            .custom(async (value) => {
                let isAdminExist = await admin.findOne({ email: value });
                if (isAdminExist) {
                    throw new Error("User with this email address already exists!!")
                }
                return true;
            }),

        check("phone").notEmpty().withMessage("Phone is required")
            .isMobilePhone("any").withMessage("Please enter a valid phone number")
            .custom(async (value) => {
                let isAdminExist = await admin.findOne({ phone: value });
                if (isAdminExist) {
                    throw new Error("User with this phone number already exists!!")
                }
                return true;
            }),

        check("password").notEmpty().withMessage("Password is Required")
            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,25}$/)
            .withMessage("Password must be 8 to 25 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character"),

        check("confirmPassword").notEmpty().withMessage("Confirm Password is Required")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password and Confirm Password Should be the same");
                }
                return true;
            }),
    ],
    loginAdmin: [
        check("phone").notEmpty().withMessage("Phone is required")
            .isMobilePhone("any").withMessage("Please enter a valid phone number")
            .custom(async (value, { req }) => {
                let isAdminExist = await admin.findOne({ phone: value });
                if (!isAdminExist) {
                    throw new Error("User with this Phone Number Does Not Exist!")
                }
                req.isAdminExist = isAdminExist;
                return true;
            }),

        check("password").notEmpty().withMessage("Password is Required").custom(async (value, { req }) => {
            if (!req.isAdminExist) {
                throw new Error("User with this email Does Not Exist!");
            }
            let isPasswordMatch = await bcrypt.compare(value, req.isAdminExist.password);
            if (!isPasswordMatch) {
                throw new Error("Password is Incorrect!!");
            }
            return true;
        })
    ],

    // category Validations
    addCategory: [
        check("categoryName").notEmpty().withMessage("Category Name is required"),
    ],

    // Chemist Registration and Login Validations
    registerChemist: [
        check("shopName").notEmpty().withMessage("Shop Name is required"),
        check("ownerName").notEmpty().withMessage("Owner Name is required"),
        check("address").notEmpty().withMessage("Address is required"),
        check("city").notEmpty().withMessage("City is required"),
        check("pincode").notEmpty().withMessage("Pincode is required"),
        check("gstOrPan").notEmpty().withMessage("GST or PAN is required"),

        check("mobile").notEmpty().withMessage("Mobile is required")
            .isMobilePhone("any").withMessage("Invalid mobile number")
            .custom(async (value) => {
                if (!(await isMobileUnique(value))) {
                    throw new Error("Mobile number already exists in the system!");
                }
                return true;
            }),

        check("email").notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .normalizeEmail()
            .custom(async (value) => {
                console.log("Checking email uniqueness:", value);

                if (!(await isEmailUnique(value))) {
                    throw new Error("Email already exists in the system!");
                }
                return true;
            }),

        check("password").notEmpty().withMessage("Password is required")
            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,25}$/)
            .withMessage("Password must be 8-25 characters and include a digit, lowercase, uppercase, and special character"),

        // DLN 1
        check("drugLicenseNumber1")
            .notEmpty().withMessage("Drug License Number 1 is required")
            .matches(/^[A-Z]{3}-[A-Z]{3}-(20|21)-\d{1,6}$/)
            .withMessage("Invalid Drug License Number 1 format! It should follow the format: GUJ-SUR-20-123456"),

        // DLN 2
        check("drugLicenseNumber2")
            .notEmpty().withMessage("Drug License Number 2 is required")
            .matches(/^[A-Z]{3}-[A-Z]{3}-(20|21)-\d{1,6}$/)
            .withMessage("Invalid Drug License Number 2 format! It should follow the format: GUJ-SUR-20-123456"),


        check("refCode")
            .notEmpty().withMessage("Reference code is required")
            .custom(async (value) => {
                const mr = await MR.findOne({ mrCode: value });
                if (!mr) {
                    throw new Error("Invalid reference code! No MR found with this code.");
                }
                return true;
            })
    ],
    loginChemist: [
        check("mobile").notEmpty().withMessage("Mobile number is required")
            .isMobilePhone("any").withMessage("Please enter a valid mobile number")
            .custom(async (value, { req }) => {
                const chemist = await Chemist.findOne({ mobile: value });
                if (!chemist) {
                    throw new Error("Chemist with this mobile number does not exist!");
                }
                if (!chemist.status) {
                    throw new Error("Your account is not yet approved by the admin. Please wait for approval.");
                }
                req.chemistUser = chemist;
                return true;
            }),

        check("password").notEmpty().withMessage("Password is required")
            .custom(async (value, { req }) => {
                if (!req.chemistUser) {
                    throw new Error("No user context found!");
                }

                const isMatch = await bcrypt.compare(value, req.chemistUser.password);
                if (!isMatch) {
                    throw new Error("Incorrect password!");
                }

                return true;
            })
    ],
    
    // MR Registration and Login Validations
    registerMR: [
        check("name").notEmpty().withMessage("Name is required")
            .isLength({ min: 3 }).withMessage("Name should be at least 3 characters"),

        check("city").notEmpty().withMessage("City is required"),

        check("mobile").notEmpty().withMessage("Mobile is required")
            .isMobilePhone("any").withMessage("Invalid mobile number")
            .custom(async (value) => {
                if (!(await isMobileUnique(value))) {
                    throw new Error("Mobile number already exists in the system!");
                }
                return true;
            }),

        check("email").notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .normalizeEmail()
            .custom(async (value) => {
                console.log("Checking email uniqueness:", value);
                if (!(await isEmailUnique(value))) {
                    throw new Error("Email already exists in the system!");
                }
                return true;
            }),

        // check("password").notEmpty().withMessage("Password is required")
        //     .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,25}$/)
        //     .withMessage("Password must be 8-25 characters and include at least one digit, lowercase, uppercase, and special character")
    ],
    loginMR: [
        check("mobile").notEmpty().withMessage("Mobile is required")
            .custom(async (value, { req }) => {
                const user = await MR.findOne({ mobile: value });
                if (!user) {
                    throw new Error("No MR found with this mobile number!");
                }
                req.user = user;
                return true;
            }),

        check("password").notEmpty().withMessage("Password is required")
            .custom(async (value, { req }) => {
                const match = await bcrypt.compare(value, req.user.password);
                if (!match) {
                    throw new Error("Incorrect password!");
                }
                return true;
            })
    ],

    // Stockist Registration and Login Validations
    registerStockist: [
        check("shopName").notEmpty().withMessage("Shop Name is required"),
        check("ownerName").notEmpty().withMessage("Owner Name is required"),
        check("address").notEmpty().withMessage("Address is required"),
        check("city").notEmpty().withMessage("City is required"),
        check("pincode").notEmpty().withMessage("Pincode is required"),

        check("mobile").notEmpty().withMessage("Mobile is required")
            .isMobilePhone("any").withMessage("Invalid mobile number")
            .custom(async (value) => {
                if (!(await isMobileUnique(value))) {
                    throw new Error("Mobile number already exists in the system!");
                }
                return true;
            }),

        check("email").notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .normalizeEmail()
            .custom(async (value) => {
                if (!(await isEmailUnique(value))) {
                    throw new Error("Email already exists in the system!");
                }
                return true;
            }),
    ],
    loginStockist: [
        check("mobile").notEmpty().withMessage("Mobile is required")
            .custom(async (value, { req }) => {
                const user = await Stockist.findOne({ mobile: value });
                if (!user) {
                    throw new Error("No Stockist found with this mobile number!");
                }
                req.user = user;
                return true;
            }),

        check("password").notEmpty().withMessage("Password is required")
            .custom(async (value, { req }) => {
                const match = await bcrypt.compare(value, req.user.password);
                if (!match) {
                    throw new Error("Incorrect password!");
                }
                return true;
            })
    ],

    // Salesman Registration and Login Validations
    registerSalesman: [
        check("stockistCode")
            .notEmpty().withMessage("Stockist code is required")
            .custom(async (value) => {
                const stockist = await Stockist.findOne({ stockistCode: value });
                if (!stockist) {
                    throw new Error("Invalid stockist code. No stockist found with this code!");
                }
                return true;
            }),

        check("name").notEmpty().withMessage("Name is required")
            .isLength({ min: 3 }).withMessage("Name should be at least 3 characters"),

        check("mobile").notEmpty().withMessage("Mobile is required")
            .isMobilePhone("any").withMessage("Invalid mobile number")
            .custom(async (value) => {
                if (!(await isMobileUnique(value))) {
                    throw new Error("Mobile number already exists in the system!");
                }
                return true;
            }),

        check("email").notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .normalizeEmail()
            .custom(async (value) => {
                if (!(await isEmailUnique(value))) {
                    throw new Error("Email already exists in the system!");
                }
                return true;
            }),
    ],
    loginSalesman: [
        check("mobile").notEmpty().withMessage("Mobile is required")
            .custom(async (value, { req }) => {
                const user = await Salesman.findOne({ mobile: value });
                if (!user) {
                    throw new Error("No Salesman found with this mobile number!");
                }
                req.user = user;
                return true;
            }),

        check("password").notEmpty().withMessage("Password is required")
            .custom(async (value, { req }) => {
                const match = await bcrypt.compare(value, req.user.password);
                if (!match) {
                    throw new Error("Incorrect password!");
                }
                return true;
            })
    ],

    // jwt validation 
    jwtValidation: passport.authenticate("jwt", { session: false }),
    jwtValidationChemist: passport.authenticate("chemist-jwt", { session: false }),
    jwtValidationMR: passport.authenticate("mr-jwt", { session: false }),
}

module.exports = validations;