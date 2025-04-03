import validator from "validator";
import sinon from "sinon";
import bcrypt from "bcrypt";
import { expect } from "chai";
import Role from "../models/Role.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const sandbox = sinon.createSandbox();

describe("User model test", () => {
  let sampleUser, findOneStub, queryMock, findOneRoleStub, bcryptStub, createStub;

  const password = "Test_123";
  const name = "Test User";
  const email = "test@gmail.com";
  const oldRole = "REVIEWER";
  const newRole = "ADMIN";
  const oldRoleId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const newRoleId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439012");

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = { _id: oldRoleId, name: oldRole };

    sampleUser = new User({
      name,
      email,
      password: hashedPassword,
      roles: [role],
    });

    sampleUser.save = sandbox.stub().resolves(sampleUser);

    queryMock = {
      populate: sandbox.stub().returnsThis(),
      exec: sandbox.stub().resolves(sampleUser)
    };

    findOneStub = sandbox.stub(User, "findOne").returns(queryMock);

    findOneRoleStub = sandbox.stub(Role, "findOne");
    findOneRoleStub.withArgs({ name: oldRole }).resolves({ _id: oldRoleId, name: oldRole });
    findOneRoleStub.withArgs({ name: newRole }).resolves({ _id: newRoleId, name: newRole });

    bcryptStub = sandbox.stub(bcrypt, "hash").resolves("hashedPassword");
    createStub = sandbox.stub(User, "create").resolves(sampleUser);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Register user", () => {
    it("should register a user with given inputs", async () => {
      findOneStub.resolves(null);
      findOneRoleStub.resolves({ _id: oldRoleId, name: oldRole });

      const result = await User.register(name, email, password);
      expect(result.email).to.equal(email);
      expect(result.name).to.equal(name);
    });

    it("should throw an error if any field is missing", async () => {
      for (const args of [
        ["", email, password],
        [name, "", password],
        [name, email, ""]
      ]) {
        try {
          await User.register(...args);
        } catch (err) {
          expect(err.message).to.equal("All field must be filled!");
        }
      }
    });

    it("should throw an error if the email is invalid", async () => {
      sandbox.stub(validator, "isEmail").returns(false);
      try {
        await User.register(name, email, password);
      } catch (err) {
        expect(err.message).to.equal("Given email is valid!");
      }
    });

    it("should throw an error if the password is not strong enough", async () => {
      sandbox.stub(validator, "isStrongPassword").returns(false);
      try {
        await User.register(name, email, password);
      } catch (err) {
        expect(err.message).to.equal("Given password is not strong enough!");
      }
    });

    it("should throw an error if the email already exists", async () => {
      findOneStub.resolves(sampleUser);
      try {
        await User.register(name, email, password);
      } catch (err) {
        expect(err.message).to.equal(`Email ${email} already in use!`);
      }
    });

    it("should throw an error if the REVIEWER role is not found", async () => {
      findOneStub.resolves(null);
      findOneRoleStub.resolves(null);
      try {
        await User.register(name, email, password);
      } catch (err) {
        expect(err.message).to.equal("Role REVIEWER not found");
      }
    });
  });

  describe("Login user", () => {
    it("should login user with given credentials and return token", async () => {
      const result = await User.login("test@gmail.com", password);
      expect(result.email).to.equal("test@gmail.com");
    });

    it("should return error when input is empty", async () => {
      try {
        await User.login("", password);
      } catch (error) {
        expect(error.message).to.equal("All field must be filled!");
      }
    });

    it("should return error when email or password is incorrect", async () => {
      try {
        await User.login("johndoe@gmail.com", password);
      } catch (error) {
        expect(error.message).to.equal("Email johndoe@gmail.com is incorrect!");
      }
      try {
        await User.login("johndoe@gmail.com", password);
      } catch (error) {
        expect(error.message).to.equal("Incorrect password!");
      }
    });
  });

  describe("Add/remove role", () => {
    it("should update user role by adding new role and removing old one", async () => {
      findOneRoleStub.withArgs({ name: oldRole }).resolves({ _id: oldRoleId, name: oldRole });
      findOneRoleStub.withArgs({ name: newRole }).resolves({ _id: newRoleId, name: newRole });

      sampleUser.roles = [{ _id: oldRoleId, name: oldRole }];

      await User.updateRole(email, newRole, oldRole);

      expect(
        sampleUser.roles.some((r) => r._id.toString() === oldRoleId.toString())
      ).to.be.false;
      expect(
        sampleUser.roles.some((r) => r._id.toString() === newRoleId.toString())
      ).to.be.true;
    });

    it("should only remove old role", async () => {
      findOneRoleStub.withArgs({ name: oldRole }).resolves({ _id: oldRoleId, name: oldRole });

      sampleUser.roles = [{ _id: oldRoleId, name: oldRole }];

      await User.updateRole(email, null, oldRole);

      expect(
        sampleUser.roles.some((r) => r._id.toString() === oldRoleId.toString())
      ).to.be.false;
    })

    it("should only add new role", async () => {
      findOneRoleStub.withArgs({ name: oldRole }).resolves({ _id: oldRoleId, name: oldRole });
      findOneRoleStub.withArgs({ name: newRole }).resolves({ _id: newRoleId, name: newRole });

      sampleUser.roles = [{ _id: oldRoleId, name: oldRole }];

      await User.updateRole(email, newRole, null);

      expect(
        sampleUser.roles.some((r) => r._id.toString() === oldRoleId.toString())
      ).to.be.true;
      expect(
        sampleUser.roles.some((r) => r._id.toString() === newRoleId.toString())
      ).to.be.true;
    })
  });
});
