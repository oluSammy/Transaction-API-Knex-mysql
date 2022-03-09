import { protectRoute } from "./../controllers/authController";
import express, { Request, Response } from "express";

import userRouter from "./users";
import accountRouter from "./accounts";

const router = express.Router();

router.use("/users", userRouter);
router.use("/accounts", protectRoute, accountRouter);

export default router;
