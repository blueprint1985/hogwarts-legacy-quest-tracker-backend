import { createPool, Pool, PoolOptions } from "mysql2/promise.js";

let pool: Pool | null = null;

export const dbPool = () => {
  if (!pool) {
    const mysqlPref: PoolOptions = {
      host: "localhost",
      database: "hogwarts_legacy_quest_tracker",
      user: "application",
      password: "password"
    };

    pool = createPool(mysqlPref);
  }

  return pool;
}