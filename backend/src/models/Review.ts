import { model, Schema } from 'mongoose';

import { IReview, STATUS_TYPES } from '../interfaces/review.interface';

const reviewSchema = new Schema<IReview>({
  author: { ref: 'User', required: true, type: Schema.Types.ObjectId },
  slug: { required: true, type: String },
  status: {
    default: STATUS_TYPES.CREATED,
    enum: Object.values(STATUS_TYPES),
    type: String,
  },
  text: { required: true, type: String },
});

const Review = model<IReview>('Review', reviewSchema);
export default Review;
