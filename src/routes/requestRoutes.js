const express = require("express");
const Connection = require("../models/connection");
const { User } = require("../models/user");
const { notificationQueue } = require("../queues");
const { notificationTypes } = require("../services/notification.service");

const router = express.Router();

router.post("/send/:status/:userId", async (req, res) => {
    try {
        const { user } = req;

        /**
        //^ Ensure token exists before verifying [Fastest way to return]
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
         */

        const userId = user.id;
        const { status, userId: requestToId } = req.params;

        //^ Exists is faster than actual look up User.findOne as id are indexed by default
        const userExists = await User.exists({ _id: requestToId });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        //^ 1. Prevent self-requests (400 Bad Request) [The fastest check]
        if (userId === requestToId) {
            return res.status(400).json({ success: false, message: `Invalid request: Cannot connect to yourself` })
        }

        //^ 2. Validate status array (400 Bad Request) [The second fastest check just need to check array]
        const allowedStatuses = ["interested", "ignored"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `connection status not allowed` })
        }

        //^3. Check for existing connection (409 Conflict) [The costliest one DB lookup]    
        const activeConnection = await Connection.findOne({
            $or: [
                { requestFromId: userId, requestToId },
                { requestFromId: requestToId, requestToId: userId }
            ]
        });

        if (activeConnection) {
            return res.status(409).json({ success: false, message: `connection already exists` })
        }

        const userConnection = new Connection({
            requestFromId: userId,
            requestToId,
            status
        })
        await userConnection.save();

        await userConnection.populate([
            { path: "requestFromId", select: "firstName" },
            { path: "requestToId", select: "firstName" }
        ])
        res.status(201).json({ success: true, message: `${userConnection.requestFromId.firstName} sent ${status} to ${userConnection.requestToId.firstName}` });
    } catch (err) {
        //^ Handle JWT or DB errors gracefully
        //# Log the errors but dont send to client
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }

})

router.post("/review/:status/:requestId", async (req, res) => {
    try {
        const { user } = req;

        const userId = user.id;
        const { status, requestId } = req.params;

        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Status not allowed" })

        const connectionReq = await Connection.findOne(
            { _id: requestId, requestToId: userId }
        );

        if (!connectionReq) return res.status(404).json({ success: false, message: "Invalid Connection" })

        console.log("connectionReq", connectionReq)
        await connectionReq.populate([
            { path: "requestToId", select: "firstName" },
            { path: "requestFromId", select: "firstName email" }
        ])
        const requestFrom = connectionReq.requestFromId.firstName;
        const requestTo = connectionReq.requestToId.firstName;

        //^Not required as FindOneAndUpdate automatically updates
        if (connectionReq.status === "interested") {
            connectionReq.status = status;
            await connectionReq.save();
        } else {
            return res.status(400).json({ success: false, message: "Connection request was already reviewed" });
        }

        if (status === "accepted") {
            const job = await notificationQueue.add(
                "connection-accepted",
                {
                    recipientUserId: connectionReq.requestFromId._id,
                    recipientEmail: connectionReq.requestFromId.email,
                    accepterName: requestTo,
                    type: notificationTypes.CONNECTION_ACCEPTED
                },
                {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 2000
                    },
                    removeOnComplete: true,
                    removeOnFail: false
                }
            );

            console.log("Job created:", job.id);
        }

        res.status(200).json({ success: true, message: `${requestTo} ${status} connection request from ${requestFrom}` })
    } catch (err) {
        console.log("Inside request/review")
        console.log(err.message);
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
})

module.exports = router;
