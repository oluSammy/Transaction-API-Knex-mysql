import { IUser } from "../../src/typings/typings";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
