const meta = {
  name: "QR Code Generator",
  version: "1.0.0",
  description: "Generate a QR code image from given text",
  author: "Ove",
  method: "get",
  category: "utility",
  path: "/text-to-qr?text="
};

const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function onStart({ res, req }) {
  const { text } = req.query;

  if (!text) return res.json({ error: "Please provide text to generate QR code" });

  try {
    // Ensure file folder exists
    const folder = path.join(process.cwd(), "file");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const filename = `qr-${Date.now()}.png`;
    const filePath = path.join(folder, filename);

    // Generate QR code and save as PNG
    await QRCode.toFile(filePath, text, {
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const qrUrl = `${baseUrl}/file/${filename}`;

    return res.json({
      status: "success",
      text: text,
      qr_code_url: qrUrl,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return res.json({ error: err.message });
  }
}

module.exports = { meta, onStart };
