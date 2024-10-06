import express from "express";
import cors from "cors";

import { availableQuests } from "./questsController";

const app = express();

app.use(express.json());
app.use(cors());

const router = express.Router();
router.post("/available_quests", availableQuests);

app.use("/api", router);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.listen(3000, () => {
  console.log("NodeJS server started!");
});
