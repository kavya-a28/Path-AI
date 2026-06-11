require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startMissedSessionScheduler } = require('./services/missedSessionScheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  startMissedSessionScheduler(); // mark overdue sessions as missed every hour

  app.listen(PORT, () => {
    console.log(`PathAI API running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start PathAI API:", error.message);
  process.exit(1);
});
