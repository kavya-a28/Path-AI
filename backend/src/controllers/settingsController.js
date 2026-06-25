const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { ErrorResponse } = require("../middleware/errorMiddleware");

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }
    
    // Return all relevant data for the Settings page
    res.status(200).json({
      success: true,
      data: {
        userData: {
          name: user.fullName,
          email: user.email,
          handle: user.handle,
          location: user.location,
          avatarUrl: user.avatarUrl,
        },
        settings: user.settings,
        stats: user.stats,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update general settings (notifications, studyTime, visibility, etc)
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    // Merge the new settings with the existing ones
    user.settings = { ...user.settings, ...req.body };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: user.settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, handle, location, avatar)
// @route   PUT /api/settings/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, handle, location, avatarUrl } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    if (name !== undefined) user.fullName = name;
    if (handle !== undefined) user.handle = handle;
    if (location !== undefined) user.location = location;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.fullName,
        handle: user.handle,
        location: user.location,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update email
// @route   PUT /api/settings/email
// @access  Private
exports.updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ErrorResponse("Please provide an email", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ErrorResponse("Email is already in use", 400);
    }

    user.email = email;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email updated successfully",
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/settings/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      throw new ErrorResponse("Please provide a password", 400);
    }

    if (password.length < 6) {
      throw new ErrorResponse("Password must be at least 6 characters", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    if (user.authProvider !== "local") {
      throw new ErrorResponse(`You are logged in with ${user.authProvider}, password cannot be changed`, 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/settings/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);
    // Alternatively, could delete related documents (roadmaps, etc.) if needed here

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
