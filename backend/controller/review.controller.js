import Mod from "../models/Mod.js";
import Review from "../models/Review.js";

export const saveReviewWithMod = async (req, res) => {
  const { reviewText, modName, specification, categories } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Preview photo file is required." });
    }
    if (!reviewText || !modName || !specification || !categories) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let parsedCategories = categories;
    if (typeof categories === "string") {
      parsedCategories = JSON.parse(categories);
    }

    let parsedSpecification = specification;
    if (typeof specification === "string") {
      parsedSpecification = JSON.parse(specification);
    }

    const review = await Review.createReview({
      authorId: req.user._id,
      reviewText,
      name: modName,
      specification: parsedSpecification,
      slugs: parsedCategories,
      previewPhoto: req.file,
    });

    return res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { reviewText } = req.body;

  try {
    if (!reviewId) {
      return res.status(400).json({ error: "Review id must be provided!" });
    }

    if (!reviewText || reviewText.trim() === "") {
      return res.status(400).json({ error: "Review text must be provided!" });
    }

    const review = await Review.updateReviewText({
      reviewId,
      reviewText,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    return res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTenReviewsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User id must be provided!" });
    }

    const review = await Review.getLastTenReviewsByUser({ userId });

    if (!review) {
      return res.status(404).json({ error: "Reviews not found!" });
    }

    return res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTenReviewsByUserAndStatus = async (req, res) => {
  const { userId, status } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User id must be provided!" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status must be provided!" });
    }

    const review = await Review.getLastTenReviewsWithSpecificStatus({
      userId,
      status,
    });

    if (!review) {
      return res.status(404).json({ error: "Reviews not found!" });
    }

    return res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLastTenReviewsWithStatusCreated = async (req, res) => {
  try {
    const review = await Review.getLastTenCreatedReviews();

    if (!review) {
      return res.status(404).json({ error: "Reviews not found!" });
    }

    return res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  const { reviewId, status } = req.params;

  if (!reviewId) {
    return res.status(400).json({ error: "Review id must be provided!" });
  }

  if (!status) {
    return res.status(400).json({ error: "Status must be provided!" });
  }
  try {
    const review = await Review.updateReviewStatus({ reviewId, status });

    if (!review) {
      return res.status(404).json({ error: "Reviews not found!" });
    }

    return res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateModSpec = async (req, res) => {
  const { modId } = req.params;
  const { specification } = req.body;
  try {
    if (!modId) {
      return res.status(400).json({ error: "Mod id must be provided!" });
    }

    const mod = await Mod.updateModSpecification({
      modId,
      specification,
    });

    return res.status(201).json(mod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublishedMods = async (req, res) => {
  try {
    const mod = await Mod.getLastTenPublishedMods();

    return res.status(200).json(mod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotPublishedMods = async (req, res) => {
  const { page, limit } = req.params;
  try {
    const mods = await Mod.getModsNotPublishedPagingAndSorting({ page, limit });

    return res.status(201).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModsCategorizied = async (req, res) => {
  const { subCategory } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const mods = await Mod.getModsByCategorie({
      subCategory,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.status(200).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModsByParams = async (req, res) => {
  const { open = true, deluxe = false, cat, page = 1, limit = 10 } = req.query;

  console.log(`Parameters: open=${open}, deluxe=${deluxe}, cat=${cat}`);
  try {
    const mods = await Mod.getModByParameters({
      isPublished: open,
      isDeluxe: deluxe,
      subCategory: cat,
      page,
      limit,
    });

    return res.status(200).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleIsDeluxeStatus = async (req, res) => {
  const { modId } = req.params;
  try {
    if (!modId) {
      return res.status(400).json({ error: "Mod id must be provided!" });
    }
    const mods = await Mod.updateModDeluxeStatus({
      modId,
    });

    return res.status(201).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePreviewPhoto = async (req, res) => {
  const { modId } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Preview photo file is required." });
    }
    if (!modId) {
      return res.status(400).json({ error: "Missing mod ID." });
    }

    const mod = await Mod.updatePreviewPhoto({
      modId,
      previewPhoto: req.file,
    });

    return res.status(201).json(mod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
