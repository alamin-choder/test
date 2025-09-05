const express = require("express");
const router = express.Router();
const Link = require("../models/link");

// Redirect short link → original URL
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Find short link in DB
    const link = await Link.findOne({ shortCode: code });
    console.log(`redirected ${req.protocol}://${req.get("host")}/${ code }`);

    if (!link) {
      return res.status(404).json({
        status: false,
        error: "Short link not found"
      });
    }

    // Increase click count
    link.clicks += 1;
    await link.save();

    // Redirect to original URL
    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: "Server error"
    });
  }
});

module.exports = router;
