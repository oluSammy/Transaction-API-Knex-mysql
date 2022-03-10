import knexConnection from "../database/db";
import { IAccount } from "../typings/typings";

class AccountRepository {
  static async createAccount(userId: string) {
    try {
      const prevAcct = await this.getAccountByUserId(userId);

      if (prevAcct.length > 0) {
        throw new Error(
          "User already has an account with the account Number " +
            prevAcct[0].account_number
        );
      }

      const lastAcct = await this.getLastAccountNumber();

      const acctNo = await this.generateAccountNumber(
        lastAcct[0].account_number
      );

      await knexConnection("accounts").insert({
        user_id: userId,
        account_number: acctNo,
        balance: 50000,
      });

      return await this.getAccountByUserId(userId);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  static async fundAccount(userId: string, amount: number) {
    try {
      const acct = await this.getAccountByUserId(userId);

      if (acct.length === 0) {
        throw new Error("User does not have an account");
      }

      await knexConnection("accounts")
        .where({ user_id: userId })
        .update({ balance: acct[0].balance + parseFloat(amount.toString()) });

      return this.getAccountByUserId(userId);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  static async getLastAccountNumber(): Promise<IAccount[]> {
    return await knexConnection("accounts")
      .select("account_number")
      .orderBy("id", "desc")
      .limit(1);
  }

  static async generateAccountNumber(lastAcctNo: string | undefined) {
    if (!lastAcctNo) {
      return "0000000001";
    } else {
      const acct = +lastAcctNo + 1;

      return acct.toString().padStart(10, "0");
    }
  }

  static async getAccountByEmail(email: string) {
    return await knexConnection("accounts").select("*").where({ email });
  }

  static async getAccountByUserId(id: string) {
    const account = await knexConnection("accounts")
      .select("*")
      .where({ user_id: id });

    if (account.length === 0) {
      throw new Error("User does not have an account");
    }

    return account;
  }

  static async checkFUndsAvailability(userId: string, amount: number) {
    const acct = await this.getAccountByUserId(userId);

    console.log(acct[0].balance < amount);
    console.log(amount);

    if (acct[0].balance < amount) {
      throw new Error("Insufficient funds");
    } else {
      return acct[0];
    }
  }

  static async withdrawFunds(userId: string, amount: number) {
    const acct = await this.checkFUndsAvailability(userId, amount);

    await knexConnection("accounts")
      .where({ user_id: userId })
      .update({ balance: acct.balance - parseFloat(amount.toString()) });

    return this.getAccountByUserId(userId);
  }

  static async getAccountByAccountNumber(account_number: string) {
    const account = await knexConnection("accounts")
      .select("*")
      .where({ account_number });

    if (account.length === 0) {
      throw new Error("Account does not exist");
    }

    return account[0];
  }

  static async transferFunds(
    fromUserId: string,
    receiverAcctNo: string,
    amount: number
  ) {
    const fromAcct = await this.checkFUndsAvailability(fromUserId, amount);
    const receiverAcct = await this.getAccountByAccountNumber(receiverAcctNo);

    // Using trx as a query builder:
    knexConnection
      .transaction(function (trx) {
        return trx("accounts")
          .update({ balance: fromAcct.balance - parseFloat(amount.toString()) })
          .where({ user_id: fromUserId })
          .then(function (ids) {
            return trx("accounts")
              .update({
                balance: receiverAcct.balance + parseFloat(amount.toString()),
              })
              .where({ account_number: receiverAcctNo });
          });
      })
      .then(function () {})
      .catch(function (error) {
        console.error(error);
        throw new Error("Transfer failed");
      });
    return this.getAccountByUserId(fromUserId);
  }
}

export default AccountRepository;
