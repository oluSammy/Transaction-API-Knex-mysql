import { Request, Response } from "express";

export const createAccount = (req: Request, res: Response) => {
  try {
    res.status(200).json({ status: "success", message: "message" });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};
