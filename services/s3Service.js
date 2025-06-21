const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.getUploadUrls = async (userId) => {
  const docTypes = ["aadhaar", "pan", "business"];
  const baseFolder = "devanshu_test";
  const userFolder = `${baseFolder}/${userId}`;

  const uploadUrls = await Promise.all(
    docTypes.map(async (type) => {
      const fileName = `${type}.jpg`;
      const key = `${userFolder}/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: "image/jpeg",
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 300 });
      return { type, fileName, key, url };
    })
  );

  return {
    userId,
    folderPrefix: userFolder,
    uploadUrls,
  };
};

exports.getDownloadUrls = async (kycDoc) => {
  const keys = Object.entries(kycDoc.documents);
  console.log(keys);
  return Promise.all(
    keys.map(async ([type, doc]) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: doc.s3_key,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 300 });
      return { type, url, status: doc.status };
    })
  );
};

exports.deleteDocObject = async (s3_key) => {
  s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3_key,
    })
  );
};
