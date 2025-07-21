import { register, updateRole } from "../service/user.service.js";

// TODO: add validation schemas

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await register(name, email, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { email, newRole, oldRole } = req.body;

  try {
    const user = await updateRole(email, newRole, oldRole);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
