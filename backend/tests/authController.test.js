import sinon from "sinon";
import jwt from "jsonwebtoken";
import express from "express";
import { loginUser, logoutUser } from "../controller/auth.controller.js";
import { expect } from "chai";
import User from "../models/User.js";
import request from "supertest";

describe("Auth Controller Integration Tests", () => {
  let app, loginStub, jwtStub;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/login", loginUser);

    loginStub = sinon.stub(User, "login").resolves({
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      roles: [{ name: "REVIEWER" }]
    });

    // Mock jwt.sign
    jwtStub = sinon.stub(jwt, "sign").returns("mockedToken");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should log in a user and return an access token", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "Test@123" })
      .expect(200);

    expect(response.body).to.have.property("email", "test@example.com");
    expect(response.body).to.have.property("accessToken", "mockedToken");

    expect(response.headers["set-cookie"][0]).to.include("refreshToken=mockedToken");

    expect(jwtStub.called).to.be.true;
    expect(loginStub.calledOnce).to.be.true;
  });
});
