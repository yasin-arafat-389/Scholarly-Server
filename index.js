const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 5001;
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    //
    //
    app.post("/generate-response", async (req, res) => {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = req.body.input;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ response: text });
      } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Decoy response
    // app.post("/generate-response", async (req, res) => {
    //   try {
    //     res.json({
    //       response:
    //         "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 andContrary to popular belief, Lorem Ipsum is not simply random text. It has roots ",
    //     });
    //   } catch (error) {
    //     console.error("Error generating response:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });
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
