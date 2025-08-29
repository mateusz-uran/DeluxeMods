import fs from 'fs/promises';
import path from 'path';

import { fileURLToPath } from 'url';

import { logError } from '../utils/errors/logError';
import { CategoryData } from '../types/Categories';
import { RoleData } from '../types/Role';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROLE_PATH = path.resolve(__dirname, './json/roles.json');
const CATEGORIES_PATH = path.resolve(__dirname, './json/categories.json');

export async function readCategories() {
  return await readRolesFile<CategoryData[]>(CATEGORIES_PATH);
}

export async function readRoles() {
  return await readRolesFile<RoleData[]>(ROLE_PATH);
}

async function readRolesFile<T>(relativePath: string): Promise<T> {
  try {
    const filePath = path.resolve(relativePath);
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData) as T;
  } catch (error: unknown) {
    logError(error);
    throw error;
  }
}
