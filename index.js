const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const openai = require("openai");
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

async function run() {
  // Define database collections here
  try {
    //
    //

    app.post("/generate-response", async (req, res) => {
      try {
        setTimeout(() => {
          res.json({
            response:
              "Big data primarily refers to data sets that are too large or complex to be dealt with by traditional data-processing application software.",
          });
        }, 5000);
      } catch (error) {
        // Handle errors
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //
    //
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
