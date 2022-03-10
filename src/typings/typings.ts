export interface IUser {
  id?: string;
  username: string;
  email: string;
  password?: string;
  token?: string;
  account_number?: string;
}

export interface IAccount {
  id: string;
  account_number: string;
  balance: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ITestConstant {
  userOne: IUser;
  userTwo: IUser;
  BASE_URL: string;
}
