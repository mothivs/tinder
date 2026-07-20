const { Worker } = require("bullmq");
const { ioRedisClient } = require("../config/redis");
const processEmailOTP = require("../services/emailotp.service");

//# worker = new Worker("name", Fn, {connection})

//^Fn - function to process jobs so params will be job

const startEmailOTPWorker = async () => {

    console.log("EMAIL OTP Worker started");

    const worker = new Worker(
        "emailotp",
        async (job) => {
            console.log("EmailOtp Job started:", job.id, job.name);
            return processEmailOTP(job.data)
        },
        {
            connection: ioRedisClient
        }
    );

    worker.on("completed", (job)=>{
        console.log("Job completed:", job?.id);
    })

    worker.on("failed", (job, err)=>{
        console.error("Job failed:", job?.id, err.message);
    })

    return worker;
}


startEmailOTPWorker().catch((err) => {
    console.error("EmailOTP worker startup failed:", err);
    process.exitCode = 1;
})