const { sendEmailOTP } = require("../utils/notification")

const processEmailOTP = async (payload) => {
    return await sendEmailOTP(payload);
}

module.exports = processEmailOTP;