import sinon from "sinon";
import jwt from "jsonwebtoken";
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

describe("User Controller Integration Tests", () => {
  const adminPayload = { roles: ["ADMIN"] };
  const token = jwt.sign(adminPayload, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });

  beforeEach(() => {
    sinon.stub(Role, "findOne").callsFake((query) => {
      if (query.name === "ADMIN") {
        return {
          lean: () =>
            Promise.resolve({
              name: "ADMIN",
              permissions: ["ADD_USER", "UPDATE_USER"],
            }),
        };
      }
      return {
        lean: () => Promise.resolve(null),
      };
    });

    sinon.stub(User, "register").resolves({
      _id: "user3",
      name: "Charlie",
      email: "charlie@example.com",
      roles: [{ name: "ADMIN" }],
    });

    sinon.stub(User, "updateRole").resolves({
      _id: "user3",
      name: "Charlie",
      email: "charlie@example.com",
      roles: [{ name: "ADMIN" }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /api/register-user", () => {
    it("should register a new user when valid data is provided", async () => {
      const newUser = {
        name: "Charlie",
        email: "charlie@example.com",
        password: "Test_123",
      };

      const response = await request(app)
        .post("/api/register-user")
        .set("Authorization", `Bearer ${token}`)
        .send(newUser)
        .expect(200);

      expect(response.body).to.have.property("success", true);
      expect(response.body.user).to.have.property("email", newUser.email);
      expect(response.body.user).to.have.property("name", newUser.name);
    });
  });

  describe("POST /api/update-role", () => {
    it("should register a new user when valid data is provided", async () => {
      const payload = {
        email: "charlie@example.com",
        newRole: "ADMIN",
        oldRole: "REVIEWER",
      };

      const response = await request(app)
        .post("/api/update-role")
        .set("Authorization", `Bearer ${token}`)
        .send(payload)
        .expect(200);

      expect(response.body).to.have.property("success", true);
      expect(response.body.user).to.have.property(
        "email",
        "charlie@example.com"
      );
    });
  });
});
