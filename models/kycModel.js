const mongoose = require("mongoose");

const KycSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  documents: {
    aadhaar: {
      s3_key: String,
      status: {
        type: String,
        enum: ["pending", "verified", "reupload"],
        default: "pending",
      },
    },
    pan: {
      s3_key: String,
      status: {
        type: String,
        enum: ["pending", "verified", "reupload"],
        default: "pending",
      },
    },
    business: {
      s3_key: String,
      status: {
        type: String,
        enum: ["pending", "verified", "reupload"],
        default: "pending",
      },
    },
  },
  kyc_status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
});

module.exports = mongoose.model("Kyc", KycSchema);
