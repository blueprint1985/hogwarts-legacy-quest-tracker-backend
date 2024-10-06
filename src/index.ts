import express, { Router } from "express";
import { availableQuests } from "./questsController";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const router = express.Router();
router.post("/available_quests", availableQuests);

app.use("/api", router);

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
