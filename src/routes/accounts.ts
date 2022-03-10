import { transferFunds } from "./../controllers/accountsController";
import express from "express";
import {
  createAccount,
  fundAccount,
  withdraw,
  getMyBalance,
} from "../controllers/accountsController";

const router = express.Router();

router.post("/create", createAccount);
router.post("/fund", fundAccount);
router.post("/withdraw", withdraw);
router.post("/transfer", transferFunds);
router.get("/balance", getMyBalance);

export default router;
