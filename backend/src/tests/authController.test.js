import sinon from "sinon";
import request from "supertest";
import jwt from "jsonwebtoken";
import { expect } from "chai";
import User from "../models/User.js";
import app from "../app.js";

describe("Auth Controller Integration Tests", () => {
  let loginStub, jwtStub;
  const name = "John";
  const email = "test@gmail.com";
  const password = "Test_123";

  beforeEach(() => {
    loginStub = sinon.stub(User, "login").resolves({
      _id: "user123",
      name,
      email,
      roles: [{ name: "REVIEWER" }],
    });

    jwtStub = sinon.stub(jwt, "sign").returns("mockedToken");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("POST /login", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email, password, rememberMe: true })
      .expect(200);

    expect(response.body).to.have.property("email", email);
    expect(response.body).to.have.property("accessToken", "mockedToken");

    const refreshTokenCookie = response.headers["set-cookie"].find((cookie) =>
      cookie.startsWith("refreshToken=")
    );

    expect(refreshTokenCookie).to.include("refreshToken=mockedToken");

    expect(response.body.message).to.equal("User logged in successfully!");

    expect(response.status).to.equal(200);

    expect(jwtStub.called).to.be.true;
    expect(loginStub.calledOnce).to.be.true;
  });

  it("POST /logout", async () => {
    const response = await request(app)
      .post("/logout")
      .set("Cookie", "refreshToken=mockedToken")
      .expect(200);

    expect(response.body).to.have.property("message", "User logout!");

    const cookies = response.headers["set-cookie"];
    expect(cookies[0]).to.include("refreshToken=;");
    expect(cookies[0]).to.include("Max-Age=0");
  });
});
