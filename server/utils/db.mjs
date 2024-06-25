// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import dotenv from "dotenv";

const {Pool} = pg.default
dotenv.config();

const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default connectionPool;
