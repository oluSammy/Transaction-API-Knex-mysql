import knex from "knex";
import config from "./knexfile";

const knexConnection = knex(config[process.env.NODE_ENV as string]);

export default knexConnection;
