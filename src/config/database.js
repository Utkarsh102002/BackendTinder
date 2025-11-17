const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://Utkarsh:Virat18@cluster.ratsu4w.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
