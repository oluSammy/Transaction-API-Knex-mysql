import { Request, Response, CookieOptions } from "express";
import { validateLogin, validateSignup } from "../validation/validation";
import jwt from "jsonwebtoken";
import { IUser } from "../typings/typings";
import bcrypt from "bcryptjs";
import UserRepository from "../models/UserRepo";

const generateToken = (id: string): string => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES as string,
  });

  return token;
};

const validatePassword = async (
  loginPass: string,
  dbPass: string
): Promise<boolean> => {
  return await bcrypt.compare(loginPass, dbPass);
};

const sendToken = (res: Response, statusCode: number, user: IUser) => {
  console.log(process.env.JWT_SECRET as string);
  const token = generateToken(user.id as unknown as string);

  const expires = new Date(Date.now() + 20 * 24 * 60 * 1000);

  const cookieOptions: CookieOptions = {
    expires,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    user,
    token: {
      token,
      expires,
    },
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(404).json({
        status: "error",
        message: `${error.message}`,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 8);

    const { username, email } = req.body;

    const data = await UserRepository.createUser({
      username,
      email,
      password: hashedPassword,
    });

    const newUser = data[0];

    newUser.password = undefined;

    sendToken(res, 201, newUser);
  } catch (e: any) {
    // console.log(e);
    res.status(500).json({ status: "error", message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      return res.status(404).json({
        status: "error",
        message: `${error.message}`,
      });
    }

    const { email, password } = req.body;

    const user = await UserRepository.getUserByEmail(email);

    if (
      user.length === 0 ||
      !(await validatePassword(password, user[0].password))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // res.send("hello");

    user[0].password = undefined;

    sendToken(res, 200, user[0]);
  } catch (e) {
    res.send(e);
  }
};
