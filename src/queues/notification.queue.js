const { Queue } = require("bullmq");
const { ioRedisClient } = require("../config/redis");

const notificationQueue = new Queue("notifications", {
    connection: ioRedisClient
})

module.exports = { notificationQueue }
