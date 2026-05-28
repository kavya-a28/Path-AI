const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env.");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || "pathai",
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDB;
