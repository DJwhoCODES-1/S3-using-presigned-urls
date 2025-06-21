## 1️⃣ Request Pre-signed Upload URLs

---

Method : POST  
URL : http://localhost:4000/kyc/request-upload  
Body :
{
"userId": "SP10001"
}

## 2️⃣ Upload Document to S3 Using Pre-signed URL

---

Method : PUT  
URL : https://sparkup-bucket.s3.ap-south-1.amazonaws.com/devanshu_test/SP10001/business.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ3EGUJOSGZSASGUI%2F20250621%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250621T071359Z&X-Amz-Expires=300&X-Amz-Signature=f9480d11256df21be9fa5c575e2575649f83af45c7f097a603a0a984e16d0f1c&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject
Headers :
{
"Content-Type": "image/jpeg"
}
Body (Binary Upload) :
{
binary: <upload_file>
}

## 3️⃣ Get Pre-signed URLs for Admin to View Uploaded Documents

---

Method : GET  
URL : http://localhost:4000/kyc/admin-documents/SP10001
