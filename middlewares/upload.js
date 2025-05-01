const multer = require('multer');
const path = require('path');
const { v4 : uuidv4} = require('uuid');

const imageSchema = (imgType) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, "../uploads/" + imgType))
        },
        filename: (req, file, cb) => {
            cb(null, uuidv4() + path.extname(file.originalname));
        }
    })
}

const uploadImage = (imgType, fields = []) => {
    return multer({
        storage: imageSchema(imgType),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb)=>{
            checkFileType(file, cb);
        }
    }).fields(fields)
}
const checkFileType = (file, cb)=>{
    let allowedFileTypes = /jpeg|jpg|png|gif/;
    let extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    let mimetype = allowedFileTypes.test(file.mimetype);

    if(extname && mimetype){
        cb(null, true);
    }else{
        cb(new Error(`Invalid file format only images are allowed`));
    }
}

module.exports = uploadImage;