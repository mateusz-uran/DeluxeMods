import fs from 'fs/promises';
import path from 'path';

import { logError } from '../utils/errors/logError';

export async function readRolesFile<T>(relativePath: string): Promise<T> {
  try {
    const filePath = path.resolve(relativePath);
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData) as T;
  } catch (error: unknown) {
    logError(error);
    throw error;
  }
}
