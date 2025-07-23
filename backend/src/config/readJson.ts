import path from 'path';
import fs from 'fs/promises';

export async function readRolesFile<T>(relativePath: string): Promise<T> {
  try {
    const filePath = path.resolve(relativePath);
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error: unknown) {
    console.log(`[Error reading file: ${error}]`);
    throw error
  }
}
