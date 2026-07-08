const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: {
            values: ["CONNECTION_REQUEST", "CONNECTION_ACCEPTED", "GENERAL"],
            message: '{VALUE} is not valid notification type'
        }
    },
    title: {
        type: String
    },
    message: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {Notification};
