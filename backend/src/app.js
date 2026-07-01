const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const questionnaireRoutes = require("./routes/questionnaireRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const peerRoutes = require("./routes/peerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PathAI API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/peers", peerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
