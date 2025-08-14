const { validationResult } = require('express-validator');
const fs = require('fs');

const handleValidations = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        try {
            if(req.files && req.files.drugLicenseImage){
                req.files.drugLicenseImage.forEach((file) => {
                    const filePath = file.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("File deleted successfully:", filePath);
                        }
                    });
                });
            }
            if(req.files && req.files.productImage){
                req.files.productImage.forEach((file) => {
                    const filePath = file.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("File deleted successfully:", filePath);
                        }
                    });
                });
            }
        } catch (error) {
            console.error("failed to delete the Images" ,error);
        }
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

module.exports = handleValidations;