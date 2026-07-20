const {Queue} = require("bullmq")
const { ioRedisClient } = require("../config/redis")

const emailOtpQueue = new Queue("emailotp", {
    connection: ioRedisClient
})

module.exports = {emailOtpQueue}