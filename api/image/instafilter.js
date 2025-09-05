const meta = {
  name: "instagram-filters",
  version: "1.0.0",
  description: "Apply Instagram-like filters to an image and save it locally",
  author: "Ove",
  method: "get",
  category: "image",
  image: "image" ,
  path: "/filter?image=&filter="
};

const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

async function onStart({ res, req }) {
  try {
    const { image, filter } = req.query;

    if (!image) return res.json({ error: "Missing required parameter: image" });
    if (!filter) return res.json({ error: "Missing required parameter: filter" });

    const filters = [
      "normal", "clarendon", "gingham", "moon", "lark", "reyes",
      "juno", "slumber", "crema", "ludwig", "aden", "perpetua"
    ];

    const f = filter.toLowerCase();

    if (!filters.includes(f)) {
      return res.json({ error: "Invalid filter", filters });
    }

    // Load the image
    const img = await Jimp.read(image);

    // Apply filters
    switch (f) {
      case "normal":
        // no changes
        break;

      case "clarendon":
        img.brightness(0.1).contrast(0.1);
        break;

      case "gingham":
        img.sepia().opacity(0.9);
        break;

      case "moon":
        img.greyscale().contrast(0.2);
        break;

      case "lark":
        img.brightness(0.15).color([{ apply: "saturate", params: [20] }]);
        break;

      case "reyes":
        img.sepia().brightness(0.1);
        break;

      case "juno":
        img.contrast(0.15).color([{ apply: "saturate", params: [30] }]);
        break;

      case "slumber":
        img.brightness(-0.1).contrast(-0.1);
        break;

      case "crema":
        img.sepia().contrast(-0.05);
        break;

      case "ludwig":
        img.brightness(0.2).contrast(0.2);
        break;

      case "aden":
        img.color([{ apply: "saturate", params: [-20] }]).brightness(0.1);
        break;

      case "perpetua":
        img.color([{ apply: "saturate", params: [30] }]).brightness(0.1);
        break;

      default:
        break;
    }

    // Ensure "file" folder exists
    // Save processed file in /file folder
    const folder = path.join(process.cwd(), "file");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    // একবারই timestamp তৈরি করো
    const timestamp = Date.now();
    const filename = `${f}-${timestamp}.jpg`;
    const outputFile = path.join(folder, filename);

    await img.quality(90).writeAsync(outputFile);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imgUrl = `${baseUrl}/file/${filename}`;

    return res.json({
      status: "success",
      filter_applied: f,
      original_image: image,
      saved_file: imgUrl,
    });


  } catch (e) {
    return res.json({ error: e.message || "Something went wrong" });
  }
}

module.exports = { meta, onStart };
