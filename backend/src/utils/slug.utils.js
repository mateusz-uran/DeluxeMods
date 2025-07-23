import { nanoid } from "nanoid";

export function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/\//g, "-") // replace slashes with -
    .replace(/[^\w\-]+/g, "") // remove non-word characters except -
    .replace(/\-\-+/g, "-") // replace multiple -- with single -
    .trim();
}

export function createSlugFromTwoTexts(textOne, textTwo) {
  const textOneSlug = createSlug(textOne, { lower: true });
  const textTwoSlug = createSlug(textTwo, { lower: true });
  const uniquePart = nanoid(6);
  return `${textTwoSlug}-${textOneSlug}-${uniquePart}`;
}
