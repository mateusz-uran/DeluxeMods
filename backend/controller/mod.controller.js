import Mod from "../models/Mod";

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
