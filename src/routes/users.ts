import express, { Request, Response } from "express";
import { signup, login } from "../controllers/authController";

const router = express.Router();

/* GET users listing. */
router.post("/signup", signup);
router.post("/login", login);

export default router;
