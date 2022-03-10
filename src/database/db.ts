import knex from "knex";
import config from "./knexfile";

const knexConnection =
  process.env.NODE_ENV === "test"
    ? knex(config.test)
    : knex(config.development);

export default knexConnection;
