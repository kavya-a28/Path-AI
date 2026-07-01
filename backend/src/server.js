require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { startMissedSessionScheduler } = require('./services/missedSessionScheduler');
const { initSocketServer } = require('./config/socketServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  startMissedSessionScheduler(); // mark overdue sessions as missed every hour

  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`PathAI API running on port ${PORT}`);
    console.log(`Socket.IO server attached`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start PathAI API:", error.message);
  process.exit(1);
});
