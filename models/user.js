// models/user.js

var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var schema = mongoose.Schema({
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'admin'],
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    profilePicture: {
        type: String, 
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
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

schema.pre('save', async function (next) {

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
schema.methods.comparePassword = async function (password, callback) {
    bcrypt.compare(password, this.password, function (error, match) {
        if (error) callback(error);
        if (match) {
            callback(null, true);
        } else {
            callback(error, false);
        }
    });
}

module.exports = mongoose.model("User", schema, "User");
