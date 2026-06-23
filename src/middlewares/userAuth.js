const userAuth = (req, res, next) => {
    try {
        //^ Ensure token exists before verifying [Fastest way to return]
        const { token } = req.cookies;

        if (token) {
            const user = jwt.verify(token, process.env.SECRET_KEY);
            req.user = user;
            next();
        }
        else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Something went wrong!" })
    }

}

module.exports = userAuth;