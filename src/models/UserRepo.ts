import knexConnection from "../database/db";
import { IUser } from "../typings/typings";

class UserRepository {
  static async createUser(user: IUser) {
    try {
      const insertedData = await knexConnection("users").insert({
        name: user.username,
        email: user.email,
        password: user.password,
      });

      return this.getUser(insertedData[0]);
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

  static async getUser(id: number) {
    try {
      return await knexConnection("users").where({ id }).select("*");
    } catch (e: any) {
      throw new Error(e);
    }
  }
}

export default UserRepository;
