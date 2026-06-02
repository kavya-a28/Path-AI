const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const questionnaireRoutes = require("./routes/questionnaireRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
