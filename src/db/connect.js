import mysql from "mysql2";

export const pool = mysql
  .createPool({
    host: "localhost",
    database: "hogwarts_legacy_quest_tracker",
    user: "application",
    password: "password"
  })
  .promise();