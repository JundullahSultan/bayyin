const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

const app = express();
dotenv.config();

// Connect to MongoDB first
// connectDB(); // Remove this duplicate call

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/", require("./routes/surahRoutes"));

if (require.main === module) {
  const startServer = async () => {
    await connectDB(); // Now waits for DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  };
  startServer();
}

module.exports = app;
