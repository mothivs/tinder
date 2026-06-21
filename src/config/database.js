const mongoose = require("mongoose");

  const connectToDB = async ()=>{
    await mongoose.connect(process.env.DB_CONNECTION_SECRET_KEY)
  }


  module.exports = {connectToDB}
  
  