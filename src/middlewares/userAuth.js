const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
    try {
        const { token } = req.cookies;

        //# 1. Fail early if no token is provided
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
        //# 2. Verify token (Will throw an error if invalid/expired)
        const user = jwt.verify(token, process.env.SECRET_KEY);

        //# 3. Attach user payload and proceed
        req.user = user;
        next();

    } catch (err) {
        console.error("Auth Error:", err.message);
        //# 4. Handle JWT-specific verification failures
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
        }
        //# 5. Catch actual server-side errors
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = userAuth;