import { Request, Response, CookieOptions, NextFunction } from "express";
import { validateLogin, validateSignup } from "../validation/validation";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../typings/typings";
import bcrypt from "bcryptjs";
import UserRepository from "../models/UserRepo";
import { v4 as uuidv4 } from "uuid";

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

const decodeToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (e: any) {
    throw new Error("Token is missing or invalid");
  }
};

const sendToken = (res: Response, statusCode: number, user: IUser) => {
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
      id: uuidv4(),
    });

    const newUser = data[0];

    // console.log(newUser);

    // newUser.password = undefined;

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
      return res.status(400).json({
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

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "unAuthorized",
        message: "Bearer Token missing or invalid",
      });
    }
    // console.log({ decodedToken });

    const decodedToken: any = decodeToken(token);

    if (!decodedToken) {
      return res.status(404).json({
        status: "unAuthorized",
        message: "Bearer Token missing or invalid",
      });
    }

    const user = await UserRepository.getUser(decodedToken.id);

    if (!user[0]) {
      return res.status(404).json({
        status: "unAuthorized",
        message: "User no longer exist",
      });
    }

    req.user = user[0];

    next();
  } catch (e: any) {
    if (e.message && e.message === "Token is missing or invalid") {
      return res.status(401).json({
        status: "unAuthorized",
        message: e.message,
      });
    }

    res.send(e);
  }
};
