import { model, Schema } from 'mongoose';
import { IReview, STATUS_TYPES } from '../interfaces/review.interface';

const reviewSchema = new Schema<IReview>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(STATUS_TYPES),
    default: STATUS_TYPES.CREATED,
  },
  slug: { type: String, required: true },
});

const Review = model<IReview>('Review', reviewSchema);
export default Review;
