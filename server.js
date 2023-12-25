const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
require("./config/database");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(
    `Our Server is running at port ${port} in Development Environment`
  );
});
