import { Request, Response } from "express";
import AccountRepository from "../models/AccountsRepo";
import {
  validateFundAccount,
  validateWithdrawAcct,
  validateTransfer,
} from "../validation/validation";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const acct = await AccountRepository.createAccount(req.user!.id);

    console.log({ acct });

    res.status(200).json({ status: "success", data: acct });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};

export const fundAccount = async (req: Request, res: Response) => {
  try {
    const { error } = validateFundAccount(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: `${error.message}`,
      });
    }

    const acct = await AccountRepository.fundAccount(
      req.user!.id,
      req.body.amount
    );

    res.status(201).json({ status: "success", data: acct });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  try {
    const { error } = validateWithdrawAcct(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: `${error.message}`,
      });
    }

    const acct = await AccountRepository.withdrawFunds(
      req.user!.id,
      req.body.amount
    );

    res.status(201).json({ status: "success", data: acct });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { error } = validateTransfer(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: `${error.message}`,
      });
    }

    const data = await AccountRepository.transferFunds(
      req.user!.id,
      req.body.receiverAcct,
      req.body.amount
    );

    res.status(200).json({ status: "Transfer Successful", balance: data[0] });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};

export const getMyBalance = async (req: Request, res: Response) => {
  try {
    const acct = await AccountRepository.getAccountByUserId(req.user!.id);

    res.status(200).json({ status: "success", data: acct[0] });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
};
