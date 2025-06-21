require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const kycRoutes = require("./routes/kyc");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB connected"));

app.use("/kyc", kycRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
