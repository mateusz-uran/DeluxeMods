import { nanoid } from 'nanoid';

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/\//g, '-') // replace slashes with -
    .replace(/[^\w]+/g, '') // remove non-word characters except -
    .replace(/-+/g, '-') // replace multiple -- with single -
    .trim();
}

export function createSlugFromTwoTexts(
  textOne: string,
  textTwo: string,
): string {
  const textOneSlug = createSlug(textOne);
  const textTwoSlug = createSlug(textTwo);
  const uniquePart = nanoid(6);
  return `${textTwoSlug}-${textOneSlug}-${uniquePart}`;
}
