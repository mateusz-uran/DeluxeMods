import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { InternalServerError, NotFoundError } from './errors/CustomError';

type CloudinaryDeleteResponse = {
  result: 'ok' | 'not found' | string;
  error?: {
    message: string;
    http_code?: number;
  };
};

export async function uploadImageToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'mods/previews',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 600, crop: 'scale' }],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result)
          return reject(new NotFoundError('No result from Cloudinary.'));
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
}

async function deleteImageFromCloudinary(
  publicId: string,
): Promise<CloudinaryDeleteResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: 'image', invalidate: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
  });
}

function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL');

  const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
  return publicIdWithExt.replace(/\.[^/.]+$/, '');
}

export async function replaceImage(
  oldUrl: string,
  buffer: Buffer,
): Promise<string> {
  const publicId = extractPublicIdFromUrl(oldUrl);
  const deleteResult = await deleteImageFromCloudinary(publicId);

  if (deleteResult.result !== 'ok' && deleteResult.result !== 'not found') {
    throw new InternalServerError('Failed to delete image from Cloudinary');
  }

  return await uploadImageToCloudinary(buffer);
}
