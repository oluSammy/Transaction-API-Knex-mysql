import express from "express";
import { createAccount } from "../controllers/accountsController";

const router = express.Router();

router.post("/create", createAccount);

export default router;
