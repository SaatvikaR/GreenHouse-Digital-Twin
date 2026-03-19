const express = require("express");
const twilio = require("twilio");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/alert", async (req, res) => {
  const { message } = req.body;
  try {
    await client.messages.create({
      from: process.env.TWILIO_FROM,
      to: process.env.TWILIO_TO,
      body: `🌿 AgriTwin Alert!\n\n${message}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log("Alert server running!")
);