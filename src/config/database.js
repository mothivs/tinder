const mongoose = require("mongoose");

const URI =
  "mongodb+srv://mothilalvs_mongo:F9zena2EtSyrdtCt@mothicluster.shduzgs.mongodb.net/devTinder?retryWrites=true&w=majority&appName=MothiCluster";

  const connectToDB = async ()=>{
    await mongoose.connect(URI)
  }


  module.exports = {connectToDB}
  
  