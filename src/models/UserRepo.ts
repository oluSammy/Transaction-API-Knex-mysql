import knexConnection from "../database/db";
import { IUser } from "../typings/typings";
import { v4 as uuidv4 } from "uuid";

class UserRepository {
  static async createUser(user: IUser) {
    try {
      const id = uuidv4();

      await knexConnection("users").insert({
        name: user.username,
        email: user.email,
        password: user.password,
        id,
      });

      return this.getUser(id);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  static async getUserByEmail(email: string) {
    try {
      return await knexConnection("users").where({ email }).select("*");
    } catch (e: any) {
      throw new Error(e);
    }
  }

  static async getUser(id: string) {
    try {
      return await knexConnection("users").where({ id }).select("*");
    } catch (e: any) {
      throw new Error(e);
    }
  }
}

export default UserRepository;
