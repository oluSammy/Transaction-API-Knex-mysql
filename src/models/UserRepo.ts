import knexConnection from "../database/db";
import { IUser } from "../typings/typings";

class UserRepository {
  static async createUser(user: IUser) {
    try {
      await knexConnection("users").insert({
        name: user.username,
        email: user.email,
        password: user.password,
        id: user.id,
      });

      return this.getUser(user.id);
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
