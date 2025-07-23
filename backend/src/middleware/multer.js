import multer from "multer";

const storage = multer.memoryStorage();
const multerUpload = multer({ storage }).single("photo");

export default multerUpload;
