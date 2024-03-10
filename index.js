const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const openai = require("openai");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5001;

// Parsers
app.use(
  cors({
    origin: ["http://localhost:5173", "https://scholarly-493f5.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

const openaiClient = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gef2z8f.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const userIPsCollection = client.db("Scholarly").collection("userIPs");
  try {
    //
    //

    async function limitMiddleware(req, res, next) {
      const ip = req.ip;
      const now = new Date();

      try {
        const rateLimitData = await userIPsCollection.findOne({ ip });

        if (!rateLimitData) {
          await userIPsCollection.insertOne({
            ip,
            requestCount: 1,
            lastRequestAt: now,
          });
        } else {
          const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          if (rateLimitData.lastRequestAt < windowStart) {
            await userIPsCollection.updateOne(
              { ip },
              { $set: { requestCount: 0, lastRequestAt: now } }
            );
          }

          if (rateLimitData.requestCount >= 3) {
            const retryAfterSecs = Math.ceil(
              (rateLimitData.lastRequestAt.getTime() - now.getTime()) / 1000
            );
            return res.status(429).json({
              error: "Too Many Requests",
              retryAfterSecs: retryAfterSecs,
            });
          }

          await userIPsCollection.updateOne(
            { ip },
            { $inc: { requestCount: 1 }, $set: { lastRequestAt: now } }
          );
        }

        next();
      } catch (error) {
        console.error("Rate limiter error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }

    app.post("/generate-response", limitMiddleware, async (req, res) => {
      try {
        // Get the user input from the request body
        const userInput = req.body.input;

        // Make a request to the OpenAI API to generate a response
        const response = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userInput }],
          max_tokens: 100,
        });

        // Return the generated response to the client
        res.json({ response: response.choices[0].message.content });
      } catch (error) {
        // Handle errors
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
