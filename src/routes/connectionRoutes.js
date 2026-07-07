const express = require("express");
const Connection = require("../models/connection");
const { User } = require("../models/user.js")

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const connections = await Connection.find({}).lean()
        res.status(200).json({
            success: true,
            message: "All connection fetched successfully",
            count: connections.length,
            data: connections
        })
    } catch (err) {
        console.log("Error in connections", err);
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
})

router.get("/pending", async (req, res) => {
    try {
        const userId = req.user.id;
        const pendingConnections = await Connection.find({ requestToId: userId, status: "interested" })
            .populate({ path: "requestFromId", select: "firstName" });

        if (pendingConnections.length === 0) {
            return res.status(200).json({
                success: true,
                message: "There are no pending connection requests.",
                count: 0,
                data: []
            });
        }
        console.log("all pending connections", pendingConnections);
        const allPendingFriendRequests = pendingConnections.map(connection => {
            return connection.requestFromId?.firstName || "Unknown User";
        });
        return res.status(200).json({
            success: true,
            message: "These are the pending connections!",
            count: allPendingFriendRequests.length,
            data: allPendingFriendRequests
        });
    } catch (err) {
        console.log("Inside pending connections", err.message);
        return res.status(500).json({ success: false, message: "Something went wrong!" })
    }
})


router.get("/feed", async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await Connection.find({
            $or: [
                { requestFromId: userId },
                { requestToId: userId }
            ]
        });

        //^My initial code
        /**
        let linkedUser = new Set();
        connections.forEach(connection => {
            linkedUser.add(connection.requestFromId.toString())
            linkedUser.add(connection.requestToId.toString())
        })
        */

        //# FlatMap is used when you want to group 2 diff condition in Map
        //# Only 1 condidion can be returned
        const connectionUserIds = connections.flatMap(connection => [
            connection.requestFromId?.toString(),
            connection.requestToId?.toString()
        ]).filter(Boolean); // Removes any null/undefined values safely

        //^ Include self ID because if not connections self has to be removed
        const uniqueExclusions = [...new Set([userId.toString(), ...connectionUserIds])];

        const usersToShowOnFeed = await User.find({
            _id: { $nin: uniqueExclusions }
        })

        return res.status(200).json({
            success: true,
            message: "All feed users fetched successfully",
            count: usersToShowOnFeed.length,
            data: usersToShowOnFeed
        })

    } catch (err) {
        console.log("Inside pending connections", err.message);
        return res.status(500).json({ success: false, message: "Something went wrong!" })
    }
})

module.exports = router;