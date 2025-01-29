const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Function to configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = 'public/img/product/';

        // Ensure the directory exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with timestamp
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// Function to validate uploaded file types
const allowedFile = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        req.fileValidationError = 'Only image files (JPG, JPEG, PNG, GIF) are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Export multer configuration
const upload = multer({ storage: storage, fileFilter: allowedFile });

module.exports = upload;
