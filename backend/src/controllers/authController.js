const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/token");

const isGoogleOAuthConfigured = () => (
  process.env.GOOGLE_CLIENT_ID
  && process.env.GOOGLE_CLIENT_ID !== "your-google-oauth-client-id.apps.googleusercontent.com"
);

const fetchGoogleUser = async (accessToken) => {
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`;
  const tokenInfoResponse = await fetch(tokenInfoUrl);
  const tokenInfo = await tokenInfoResponse.json();

  if (!tokenInfoResponse.ok) {
    throw new Error(tokenInfo.error_description || "Invalid Google access token");
  }

  const tokenAudience = tokenInfo.aud || tokenInfo.audience || tokenInfo.issued_to;

  if (tokenAudience !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID mismatch");
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const userInfo = await userInfoResponse.json();

  if (!userInfoResponse.ok) {
    throw new Error(userInfo.error_description || "Could not fetch Google profile");
  }

  if (!userInfo.email_verified) {
    throw new Error("Google email is not verified");
  }

  return userInfo;
};

const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user._id);

  return res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    const { fullName, email, password, college } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      college,
    });

    return sendAuthResponse(res, 201, user);
  } catch (error) {
    console.error("Signup error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Server error"
        : error.message || "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Server error"
        : error.message || "Server error",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    if (!isGoogleOAuthConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth is not configured",
      });
    }

    const { accessToken } = req.body;
    const googleUser = await fetchGoogleUser(accessToken);
    const email = googleUser.email.toLowerCase();

    let user = await User.findOne({ email });

    if (user) {
      user.googleId = user.googleId || googleUser.sub;
      user.avatarUrl = googleUser.picture || user.avatarUrl;
      user.lastLoginAt = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        fullName: googleUser.name || email.split("@")[0],
        email,
        authProvider: "google",
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture || "",
        lastLoginAt: new Date(),
      });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  signup,
  login,
  googleLogin,
  getMe,
};
