const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    requestFromId: {
        type: mongoose.Schema.Types.ObjectId, // Fix 1: Correct type definition
        required: true,
        ref: 'User' // Highly recommended: allows you to use .populate()
    },
    requestToId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: '{VALUE} is not a valid connection status'
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

connectionSchema.index({requestFromId: 1, requestToId: 1}, {unique: true})

const Connection = new mongoose.model("Connection", connectionSchema);



module.exports = Connection;