const { emailOtpQueue } = require("./emailotp.queue");
const { notificationQueue } = require("./notification.queue");

module.exports = {
    notificationQueue,
    emailOtpQueue
}
