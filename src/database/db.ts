import knex from "knex";
import config from "./knexfile";

const knexConnection = knex(config.development);

export default knexConnection;
