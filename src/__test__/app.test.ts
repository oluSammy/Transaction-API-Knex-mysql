import knexConnection from "../database/db";
import request from "supertest";
import app from "../app";
import { ITestConstant } from "../typings/typings";

beforeAll(async () => {
  try {
    await knexConnection.migrate.latest({ directory: "migrations" });
    console.log("Migration complete");
  } catch (e) {
    console.log("Migration Failed");
  }
});

afterAll(async () => {
  try {
    await knexConnection.migrate.rollback({ directory: "migrations" });
    knexConnection.destroy();
  } catch (e) {
    console.log(e);
  }
});

const constants: ITestConstant = {
  BASE_URL: "/api/v1",
  userOne: {
    password: "password",
    email: "userone@gmail.com",
    username: "userone",
  },
  userTwo: {
    password: "password",
    email: "usertwo@gmail.com",
    username: "usertwo",
  },
};

describe("Authentication", () => {
  it("should Signup", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/auth/signup`)
      .send(constants.userOne);

    const response1 = await request(app)
      .post(`${constants.BASE_URL}/auth/signup`)
      .send(constants.userTwo);

    expect(response.body.status).toBe("success");
    expect(response.status).toBe(201);

    expect(response.body.user.name).toBe(constants.userOne.username);
    expect(response.body.user.email).toBe(constants.userOne.email);

    constants.userOne.token = response.body.token.token;
    constants.userOne.id = response.body.user.id;

    constants.userTwo.token = response1.body.token.token;
    constants.userTwo.id = response1.body.user.id;

    expect(response.status).toBe(201);
  });

  it("should signin a user", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/auth/login`)
      .send({
        email: constants.userOne.email,
        password: constants.userOne.password,
      });

    expect(response.body.status).toBe("success");
    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe(constants.userOne.username);
    expect(response.body.user.email).toBe(constants.userOne.email);
  });
});

describe("create accounts", () => {
  it("should create accounts", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/accounts/create`)
      .set("Authorization", `Bearer ${constants.userOne.token}`);

    const response2 = await request(app)
      .post(`${constants.BASE_URL}/accounts/create`)
      .set("Authorization", `Bearer ${constants.userTwo.token}`);

    expect(response.status).toBe(201);
    expect(response.body.data.user_id).toBe(constants.userOne.id);

    constants.userOne.account_number = response.body.data.account_number;
    constants.userTwo.account_number = response2.body.data.account_number;
  });
});

describe("Accounts Fund And Balance", () => {
  it("should Fund Account", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/accounts/fund`)
      .send({ amount: 50000 })
      .set("Authorization", `Bearer ${constants.userTwo.token}`);

    expect(response.status).toBe(201);
  });

  it("should get account balance of a user", async () => {
    const response = await request(app)
      .get(`${constants.BASE_URL}/accounts/balance`)
      .set("Authorization", `Bearer ${constants.userTwo.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.balance).toBe(50000);
  });
});

describe("withdraw and transfer", () => {
  it("should withdraw from account", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/accounts/withdraw`)
      .send({ amount: 10000 })
      .set("Authorization", `Bearer ${constants.userTwo.token}`);

    expect(response.body.data.balance).toBe(40000);
    expect(response.status).toBe(201);
  });

  it("should transfer funds", async () => {
    const response = await request(app)
      .post(`${constants.BASE_URL}/accounts/transfer`)
      .send({
        amount: 10000,
        receiverAcct: constants.userOne.account_number,
      })
      .set("Authorization", `Bearer ${constants.userTwo.token}`);

    expect(response.status).toBe(200);
  });

  it("should receive funds", async () => {
    const response = await request(app)
      .get(`${constants.BASE_URL}/accounts/balance`)
      .set("Authorization", `Bearer ${constants.userOne.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.balance).toBe(10000);
  });
});
