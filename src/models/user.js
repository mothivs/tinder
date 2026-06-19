const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    userName:{
        type: String,
        required: [true, 'user name is required']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address.'
        }
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => validator.isMobilePhone(value, 'any'),
            message: 'Please provide a valid phone number.'
        }
    },
    gender: {
        type: String,
        required: false
    }
})

const User = mongoose.model("User", userSchema);

module.exports = {User};
