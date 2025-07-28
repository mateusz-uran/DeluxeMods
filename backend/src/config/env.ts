import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    mongoUri: string;
    frontendUri: string;
    tokenSecret: string;
    refreshSecret: string;
}

const config: Config = {
    port: Number(process.env.APP_PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_DB_URI || '',
    frontendUri: process.env.FRONTEND_URL || 'http://localhost:3000',
    tokenSecret: process.env.TOKEN_SECRET || '',
    refreshSecret: process.env.REFRESH_SECRET || ''
}

export default config