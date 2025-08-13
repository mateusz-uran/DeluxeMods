import { RequestHandler } from 'express';
import {
  createModWithPreviewPhoto,
  getPerSixMods,
} from '../service/mod.service';
import { BadRequestError } from '../utils/errors/CustomError';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '../utils/constants';


const formatBytes = (bytes: number, decimals: number = 2): number | string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getModsByParameter: RequestHandler = async (req, res, next) => {
  const { category, page } = req.validated!.query;

  try {
    const mods = await getPerSixMods({ subCategory: category, page });
    return res.status(200).json(mods);
  } catch (error) {
    next(error);
  }
};

export const createMod: RequestHandler = async (req, res, next) => {
  const { name, specification, categories } = req.validated!.body;
  const photo = req.file;

  try {
    if (!photo) {
      throw new BadRequestError('Please select an image file.');
    }

    if (photo.size > MAX_FILE_SIZE) {
      throw new BadRequestError(
        `The image is too large. Please choose an image smaller than ${formatBytes(
          MAX_FILE_SIZE,
        )}.`,
      );
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(photo.mimetype)) {
      throw new BadRequestError(
        'Please upload a valid image file (JPEG, PNG, JPG).',
      );
    }

    const mod = await createModWithPreviewPhoto({
      name,
      previewPhoto: photo,
      specification,
      categorySlugs: categories,
    });

    return res.status(200).json(mod);
  } catch (error) {
    next(error);
  }
};
