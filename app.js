require("dotenv").config();

require("./utils/db-connection");

const cookieParser = require("cookie-parser");

const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 3000;

const authRouter = require("./routes/auth");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRouter);

app.listen(port, () => {
    console.log("App is running on ", port);
});
