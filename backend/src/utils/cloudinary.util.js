import cloudinary from "../config/cloudinary.js";
import { InternalServerError } from "./errors/CustomError.js";

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

export async function deleteImageFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image", invalidate: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

export function extractPublicIdFromUrl(url) {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL");

  const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
  return publicIdWithExt.replace(/\.[^/.]+$/, "");
}

export async function replaceImage(oldUrl, buffer) {
  const publicId = extractPublicIdFromUrl(oldUrl);
  const deleteResult = await deleteImageFromCloudinary(publicId);

  if (deleteResult.result !== "ok" && deleteResult.result !== "not found") {
    throw new InternalServerError("Failed to delete image from Cloudinary");
  }

  return await uploadImageToCloudinary(buffer);
}
