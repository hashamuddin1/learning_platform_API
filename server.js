const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
require("./config/database");
const authRouter = require("./routers/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use([authRouter]);

app.listen(port, () => {
  console.log(
    `Our Server is running at port ${port} in Development Environment`
  );
});
