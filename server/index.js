require("dotenv").config(); // load any .env variables
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
// app.use(
//   cors({
//     origin: true, // allow requests from any origin
//     // credentials: true,
//     optionSuccessStatus: 200,
//   })
// );

app.use(cors());

app.use(bodyParser.json());
const port = process.env.PORT || 5000; // port to run server on

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // POST endpoint for receiving user input and generating text
  app.post("/api", async (req, res) => {
    try {
      const { inputData } = req.body; // Extract user input from request body
      const result = await model.generateContent(inputData); // send user input to the AI model
      const response = result.response;
      const text = response.text();
      // console.log(text);
      res.json({ text }); // Send generated text as JSON response
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Start the Express server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

run();
