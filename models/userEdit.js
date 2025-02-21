// models/user.js

var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'admin'], // Added 'admin' role
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+?\d{10,15}$/, 'Please use a valid phone number.']
    },
    profilePicture: {
        type: String, // URL to the image location
        default: ''
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    timestamps: true
}
);

schema.pre('save', function (next) {

    var user = this;

    // generate a salt

    if (user.isModified("password") || user.isNew) {

        bcrypt.genSalt(10, function (error, salt) {

            if (error) return next(error);

            // hash the password along with our new salt

            bcrypt.hash(user.password, salt, function (error, hash) {

                if (error) return next(error);

                // override the cleartext password with the hashed one

                user.password = hash;

                next(null, user);
            });
        });

    } else {
        next(null, user);
    }
});

/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, match) {
        if (error) callback(error);
        if (match) {
            callback(null, true);
        } else {
            callback(error, false);
        }
    });
}

module.exports = mongoose.model("UsersEdit", schema, "UsersEdit");
