import Mod from "../models/Mod.js";
import Review from "../models/Review.js";

export const saveReviewWithMod = async (req, res) => {
  const { authorId, reviewText, modName, specification, categories } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Preview photo file is required." });
    }
    if (!authorId || !reviewText || !modName || !specification || !categories) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let categoryArray = categories;
    if (typeof categories === "string") {
      categoryArray = JSON.parse(categories);
    }

    let specJson = specification;
    if (typeof specification === "string") {
      specJson = JSON.parse(specification);
    }

    const review = await Review.createReview({
      authorId,
      reviewText,
      name: modName,
      specification: specJson,
      categories: categoryArray,
      previewPhoto: req.file,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error(`Controller error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const saveMod = async (req, res) => {
  const { name, specification, categories } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Preview photo file is required." });
    }
    if (!name || !specification || !categories) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let categoryArray = categories;
    if (typeof categories === "string") {
      categoryArray = JSON.parse(categories);
    }

    const mod = await Mod.createMod({
      name,
      previewPhoto: req.file,
      specification,
      categories: categoryArray,
    });

    return res.status(201).json(mod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
