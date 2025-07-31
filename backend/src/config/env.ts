import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  frontendUri: string;
  tokenSecret: string;
  refreshSecret: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

const config: Config = {
  port: Number(process.env.APP_PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: getEnvVar('MONGO_DB_URI'),
  frontendUri: getEnvVar('FRONTEND_URL'),
  tokenSecret: getEnvVar('TOKEN_SECRET'),
  refreshSecret: getEnvVar('REFRESH_SECRET'),
  cloudinaryCloudName: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: getEnvVar('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
};

export default config;
