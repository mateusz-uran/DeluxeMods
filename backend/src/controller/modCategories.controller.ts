import { RequestHandler } from 'express';
import { getAllCategories } from '../service/modCategories.service';

export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
