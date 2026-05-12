const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", adminRoutes);
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
