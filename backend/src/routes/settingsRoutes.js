const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getSettings,
  updateSettings,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount,
} = require("../controllers/settingsController");

const router = express.Router();

router.use(protect); // All settings routes require authentication

router.route("/")
  .get(getSettings)
  .put(updateSettings);

router.put("/profile", updateProfile);
router.put("/email", updateEmail);
router.put("/password", updatePassword);
router.delete("/account", deleteAccount);

module.exports = router;
