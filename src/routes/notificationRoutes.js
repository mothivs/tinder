const express = require("express");
const { Notification } = require("../models/notification");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error("Fetch notifications failed:", err.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

router.patch("/:id/read", async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (err) {
        console.error("Mark notification read failed:", err.message);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

module.exports = router;
