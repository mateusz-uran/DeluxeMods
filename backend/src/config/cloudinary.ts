import { v2 as cloudinary } from 'cloudinary';

import config from './env';

cloudinary.config({
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  cloud_name: config.cloudinaryCloudName,
});

export default cloudinary;
