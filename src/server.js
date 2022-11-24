const express = require("express");
const app = express();
const cors = require("cors");
const blogRouter = require("../routes/blog");
const seed = require("../db/seed");

// Set JSON as format
app.use(cors());
app.use(express.json());
app.use("/blog", blogRouter);

app.listen(5001, async () => {
  await seed();
  console.log("listening to port 5001");
});
