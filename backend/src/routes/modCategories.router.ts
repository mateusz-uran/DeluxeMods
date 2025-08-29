import express from 'express';
import { getCategories } from '../controller/modCategories.controller';

const router = express.Router();

router.get('/all', getCategories);

export default router;
