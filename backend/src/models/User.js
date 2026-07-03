const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [80, "Full name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    password: {
      type: String,
      required() {
        return this.authProvider === "local";
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    handle: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      maxlength: [120, "College name cannot exceed 120 characters"],
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    onboardingStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    onboardingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnboardingSession",
      default: null,
    },
    profile: {
      goals: [String],
      currentSkills: [String],
      interests: [String],
      preferredDomains: [String],
      preferredLanguage: String,
      dsaLevel: String,
      studyHoursPerDay: Number,
      consistencyLevel: String,
      learningStyle: String,
      targetCompanies: [String],
      timeline: String,
      projectExperience: String,
      learningIntensity: {
        type: String,
        enum: ["light", "balanced", "intense"],
        default: "balanced",
      },
      collegeTimings: {
        start: String,
        end: String,
      },
      freeTimeSlots: [
        {
          day: String,
          start: String,
          end: String,
        },
      ],
      energyPattern: {
        type: String,
        enum: ["morning", "afternoon", "evening", "night", "mixed"],
        default: "mixed",
      },
    },
    settings: {
      notifications: {
        dailyReminders: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: true },
        careerAlerts: { type: Boolean, default: true },
        communityUpdates: { type: Boolean, default: false },
      },
      studyTime: { type: Number, default: 2 },
      profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
      connectedAccounts: {
        github: { connected: { type: Boolean, default: false }, username: { type: String, default: null } },
        linkedin: { connected: { type: Boolean, default: false }, username: { type: String, default: null } },
        leetcode: { connected: { type: Boolean, default: false }, username: { type: String, default: null } },
      },
      smartScheduleEnabled: { type: Boolean, default: false },
    },
    stats: {
      streak: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      skills: [
        {
          name: { type: String },
          progress: { type: Number, default: 0 },
          color: { type: String, default: "from-emerald-500 to-teal-500" }
        }
      ]
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
