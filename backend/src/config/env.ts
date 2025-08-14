import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? '.env' });

interface Config {
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryCloudName: string;
  frontendUri: string;
  mongoUri: string;
  nodeEnv: string;
  port: number;
  refreshSecret: string;
  tokenSecret: string;
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const config: Config = {
  cloudinaryApiKey: getEnvVar('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
  cloudinaryCloudName: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  frontendUri: getEnvVar('FRONTEND_URL'),
  mongoUri: getEnvVar('MONGO_DB_URI'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.APP_PORT) || 5000,
  refreshSecret: getEnvVar('REFRESH_SECRET'),
  tokenSecret: getEnvVar('TOKEN_SECRET'),
};

export default config;
