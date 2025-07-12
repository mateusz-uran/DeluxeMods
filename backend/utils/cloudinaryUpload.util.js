import cloudinary from "../config/cloudinary.js";

export async function uploadImageToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mods/previews",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 600, crop: "scale" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}
