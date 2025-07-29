import { TokenPayload } from '../../middleware/authorize';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      validated?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}
