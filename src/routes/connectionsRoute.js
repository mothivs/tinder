const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const SECRET_KEY = 'your-super-long-and-secure-secret-key';
const Connection = require("../models/connection");
const {User} = require("../models/user");


router.post("/request/send/:status/:userId", async (req, res) => {
    try {
        const userCookies = req.cookies;
        const { token } = userCookies;

        //^ Ensure token exists before verifying [Fastest way to return]
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = jwt.verify(token, SECRET_KEY)
        const userId = payload.id;
        const { status, userId: requestToId } = req.params;

        //^ Exists is faster than actual look up User.findOne as id are indexed by default
        const userExists = await User.exists({ _id: requestToId });
        if (!userExists){
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
        res.status(201).json({ success: true, message: `user ${userId} sent ${status} to ${requestToId}` });
    } catch (err) {
        //^ Handle JWT or DB errors gracefully
        //# Log the errors but dont send to client
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }

})

router.post("/request/review/:status/:requestId", async (req, res)=>{
    try{
        const userCookies = req.cookies;
        const { token } = userCookies;

        //^ Ensure token exists before verifying [Fastest way to return]
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = jwt.verify(token, SECRET_KEY)
        const userId = payload.id;
        const { status, requestId } = req.params;

        const allowedStatuses = ["accepted", "rejected"];
        if(!allowedStatuses.includes(status)) return res.status(400).json({success: false, message: "Status not allowed"})

        const connectionReqId = await Connection.findOneAndUpdate(
            {_id: requestId, requestToId: userId}, 
            {status: status},           // Update status to 'accepted' or 'rejected'
            {new: false, runValidators: true}
     );

        if(!connectionReqId) return res.status(404).json({success: false, message: "Invalid Connection"})
    
        connectionReqId.save();
        res.status(200).json({success: true, message: "Connection status updated"})
    }catch(err){
        console.log(err.message);
        res.status(500).json({success: false, message: "Something went wrong"})
    }
})

module.exports = router;