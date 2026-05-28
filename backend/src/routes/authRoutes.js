const express = require("express");
const { body } = require("express-validator");
const { signup, login, googleLogin, getMe } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/signup",
  [
    body("fullName")
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Full name must be between 2 and 80 characters"),
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      })
      .withMessage("Password must be at least 8 characters and include uppercase, lowercase, and number"),
    body("college").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post(
  "/google",
  [body("accessToken").notEmpty().withMessage("Google access token is required")],
  googleLogin
);

router.get("/me", protect, getMe);

module.exports = router;
