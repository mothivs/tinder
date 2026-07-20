const { Notification } = require("../models/notification");
const { sendConnectionAcceptedEmail } = require("../utils/notification");

const notificationTypes = {
    CONNECTION_ACCEPTED: "CONNECTION_ACCEPTED"
};

const createConnectionAcceptedNotification = async (payload) => {
    const {
        recipientUserId,
        recipientEmail,
        accepterName
    } = payload;

    const notification = await Notification.create({
        userId: recipientUserId,
        type: notificationTypes.CONNECTION_ACCEPTED,
        title: "Connection accepted",
        message: `${accepterName} accepted your connection request.`
    });

    console.log("Notification saved:", notification._id.toString());

    await sendConnectionAcceptedEmail({
        to: recipientEmail,
        accepterName
    });

    console.log("Email sent:", recipientEmail);

    return notification;
};

const processNotification = async (payload) => {
    if (payload.type === notificationTypes.CONNECTION_ACCEPTED) {
        return createConnectionAcceptedNotification(payload);
    }

    throw new Error(`Unsupported notification type: ${payload.type}`);
};

module.exports = {
    processNotification,
    createConnectionAcceptedNotification,
    notificationTypes
};
