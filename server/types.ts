
import { Request as ExpressRequest } from 'express';

export interface ReplitUser {
  id: string;
  name: string;
  profileImage?: string;
  roles?: string[];
  isReplitUser: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReplitUser;
    }
  }
}
