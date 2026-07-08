const { Worker } = require("bullmq");
const { connectToDB } = require("../config/database");
const { ioRedisClient } = require("../config/redis");
const { processNotification } = require("../services/notification.service");
require("dotenv").config();

const startNotificationWorker = async () => {
    await connectToDB();
    console.log("Notification worker connected to MongoDB");

    const worker = new Worker(
        "notifications",
        async (job) => {
            console.log("Job started:", job.id, job.name);
            return processNotification(job.data);
        },
        {
            connection: ioRedisClient
        }
    );

    worker.on("completed", (job) => {
        console.log("Job completed:", job.id);
    });

    worker.on("failed", (job, err) => {
        console.error("Job failed:", job?.id, err.message);
    });

    return worker;
};

startNotificationWorker().catch((err) => {
    console.error("Notification worker startup failed:", err);
    process.exitCode = 1;
});
