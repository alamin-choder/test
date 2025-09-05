const { activeBombers } = require("./start");

const meta = {
  name: "stop",
  version: "1.0.0",
  description: "Stop bomber attack on a number",
  author: "Ove",
  method: "get",
  category: "bomber",
  path: "/stop?number="
};

async function onStart({ res, req }) {
  const { number } = req.query;

  if (!number) {
    return res.json({ error: "Missing parameter. Use ?number=" });
  }

  if (activeBombers[number]) {
    delete activeBombers[number];
    return res.json({
      message: `Bomber stopped on ${number}`,
      powered_by: "Wataru API"
    });
  } else {
    return res.json({ error: "No active bomber found for this number" });
  }
}

module.exports = { meta, onStart };
