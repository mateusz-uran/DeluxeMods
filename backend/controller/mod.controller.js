import Mod from "../models/Mod.js";
import ModCategories from "../models/ModCategories.js";

export const getSingleMod = async (req, res) => {
  const { modSlug } = req.params;

  try {
    if (!modSlug) {
      return res.status(400).json({ error: "Mod slug must be provided!" });
    }
    const mod = await Mod.getSingleMod({
      modSlug,
    });

    return res.status(201).json(mod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSingleModAndReview = async (req, res) => {
  const { modSlug } = req.params;

  try {
    if (!modSlug) {
      return res.status(400).json({ error: "Mod slug must be provided!" });
    }
    const mod = await Mod.getSingleModWithReview({
      modSlug,
    });

    return res.status(201).json(mod);
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

/** replace function to fetch 6 mods per page instead of 10 **/
export const getPublishedMods = async (req, res) => {
  const { page, limit } = req.params;
  try {
    const mod = await Mod.getLastSixPublishedModsPaging({ page });

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
  const { page = 1, limit = 6 } = req.query;
  try {
    const mods = await Mod.getModsByCategory({
      subCategory,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.status(200).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModsCategorizedWithPaging = async (req, res) => {
  const { subCategory, page } = req.params;
  console.log(`Calling controller with params: ${subCategory}, ${page}`);
  

  try {
    const mods = await Mod.getModsByCategory({
      subCategory,
      page: parseInt(page),
    });

    return res.status(200).json(mods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModsByParams = async (req, res) => {
  const { deluxe = "false", cat, page = 1, limit = 10 } = req.query;

  const isDeluxe = deluxe.toLowerCase() === "true";
  const subCategory = Array.isArray(cat) ? cat : cat ? [cat] : [];

  try {
    const mods = await Mod.getModByParameters({
      isDeluxe,
      subCategory,
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

export const fetchAllCategories = async (req, res) => {
  try {
    const categories = await ModCategories.allCategories();
    return res.status(201).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
