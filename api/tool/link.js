const Link = require("../../models/link"); // link.js model import
const crypto = require("crypto");

// API metadata
const meta = {
  name: "Short Link",
  version: "1.0.0",
  description: "Shorten a given URL with custom or random code",
  author: "Al amin",
  method: "get",

  category: "tool",
  path: "/short?link=&code="
};       

// API logic
async function onStart({ res, req }) {
  try {
    const { link, code } = req.query;

    // Check if link is provided
    if (!link) {
      return res.status(400).json({
        status: false,
        error: "link parameter is required"
      });
    }

    // If user provides code, use that, otherwise generate random 6 digit
    const shortCode =
      code && code.trim() !== ""
        ? code
        : crypto.randomBytes(3).toString("hex"); // 6 char hex string

    // Check if code already exists
    const existing = await Link.findOne({ shortCode });
    if (existing) {
      return res.status(400).json({
        status: false,
        error: "This short code already exists. Try another."
      });
    }

    // Save new link
    const newLink = await Link.create({
      originalUrl: link,
      shortCode
    });

    // Make short URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const shortUrl = `${baseUrl}/link/${newLink.shortCode}`;

    return res.json({
      status: true,
      original: newLink.originalUrl,
      short: shortUrl,
      code: newLink.shortCode,
      createdAt: newLink.createdAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: "Server error"
    });
  }
}

module.exports = { meta, onStart };
