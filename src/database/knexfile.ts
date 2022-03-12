import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.localhost,
      port: 3306,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    },
    migrations: {
      tableName: "migrations",
      directory: "../../migrations",
    },
  },

  test: {
    client: "mysql",
    connection: {
      host: process.env.localhost,
      port: 3306,
      user: process.env.user,
      password: process.env.password,
      database: process.env.test_database,
    },
    migrations: {
      tableName: "migrations",
      directory: "../../migrations",
    },
  },
};

export default config;
