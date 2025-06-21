const express = require("express");
const router = express.Router();
const KycModel = require("../models/kycModel");
const {
  getUploadUrls,
  getDownloadUrls,
  deleteDocObject,
} = require("../services/s3Service");

// Generate pre-signed URLs and create DB record
router.post("/request-upload", async (req, res) => {
  const { userId } = req.body;
  const result = await getUploadUrls(userId);

  //   console.dir(result, { null: true });

  await KycModel.findOneAndUpdate(
    { userId },
    {
      userId,
      documents: Object.fromEntries(
        result?.uploadUrls.map(({ type, key }) => [
          type,
          { s3_key: key, status: "pending" },
        ])
      ),
      kyc_status: "pending",
    },
    { upsert: true }
  );

  res.json({ urls: result.uploadUrls });
});

// Admin fetch document links
router.get("/admin-documents/:userId", async (req, res) => {
  const userId = req.params.userId;
  const [kycDoc] = await KycModel.aggregate([{ $match: { userId } }]);
  if (!kycDoc) return res.status(404).json({ message: "Not found" });

  const downloadUrls = await getDownloadUrls(kycDoc);
  res.json({ downloadUrls });
});

// Admin verifies or rejects docs
router.post("/admin-verify", async (req, res) => {
  const { userId, statusMap } = req.body;

  const updates = {};
  for (const [doc, status] of Object.entries(statusMap)) {
    updates[`documents.${doc}.status`] = status;
  }

  const doc = await KycModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...updates,
        kyc_status: Object.values(statusMap).every((s) => s === "verified")
          ? "approved"
          : "pending",
      },
    },
    { new: true }
  );

  res.json({ updated: true, doc });
});

// Admin requests or rejects docs
router.post("/request-reupload", async (req, res) => {
  try {
    const { userId, docType } = req.body;

    if (!userId || !docType) {
      return res
        .status(400)
        .json({ message: "userId and docType are required" });
    }

    const kycDoc = await KycModel.findOne({ userId });
    if (!kycDoc || !kycDoc.documents?.[docType]) {
      return res
        .status(404)
        .json({ message: "Document not found for this user" });
    }

    const s3_key = kycDoc.documents[docType].s3_key;

    // Delete existing object
    await deleteDocObject(s3_key);

    // Update status in MongoDB
    kycDoc.documents[docType].status = "reupload";
    await kycDoc.save();

    return res.status(200).json({
      message: "Reupload requested",
      s3_key,
      status: "reupload",
    });
  } catch (err) {
    console.error("Reupload error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
