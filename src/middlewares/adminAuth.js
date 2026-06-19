const key = "XYZ";
const adminAuth = (req,res, next)=>{
    if(key === "XYZ"){
        next();
    }
    else {
        res.status(401).send("Unauthorised request!")
    }
}

module.exports = {adminAuth};