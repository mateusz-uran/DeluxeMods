import { UploadApiResponse } from 'cloudinary';

import cloudinary from '../config/cloudinary';
import { InternalServerError, NotFoundError } from './errors/CustomError';

interface CloudinaryDeleteResponse {
  error?: {
    http_code?: number;
    message: string;
  };
  result: 'not found' | 'ok';
}

export async function replaceImage(
  oldUrl: string,
  buffer: Buffer,
): Promise<string> {
  const publicId = extractPublicIdFromUrl(oldUrl);
  
  let deleteResult: CloudinaryDeleteResponse;

  try {
    deleteResult = await deleteImageFromCloudinary(publicId);
  } catch (error: unknown) {
    throw new InternalServerError(
      error instanceof Error ? error.message : String(error),
    );
  }

  if (deleteResult.result !== 'ok') {
    throw new InternalServerError('Failed to delete image from Cloudinary');
  }

  return await uploadImageToCloudinary(buffer);
}

export async function uploadImageToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        allowed_formats: ['jpg', 'jpeg', 'png'],
        folder: 'mods/previews',
        transformation: [{ crop: 'scale', width: 600 }],
      },
      (error, result: undefined | UploadApiResponse) => {
        if (error) {
          reject(error instanceof Error ? error : new Error(JSON.stringify(error)));
          return;
        }
        if (!result) {
          reject(new NotFoundError('No result from Cloudinary.'));
          return;
        }
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
    void cloudinary.uploader.destroy(
      publicId,
      { invalidate: true, resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
          return;
        }
        resolve(result as CloudinaryDeleteResponse);
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
