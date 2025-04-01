import User from "../models/User.js";
import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcrypt";
import Role from "../models/Role.js";
import validator from "validator";

const sandbox = sinon.createSandbox();

describe("User model test", () => {
  let sampleUser,
    findOneStub,
    queryMock,
    createStub,
    findOneRoleStub,
    bcryptStub;
  const password = "Test_123";
  const name = "Test User";
  const email = "test@gmail.com";

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    sampleUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    queryMock = {
      populate: sandbox.stub().returnsThis(),
      exec: sandbox.stub().resolves(sampleUser),
    };

    findOneRoleStub = sandbox.stub(Role, "findOne");
    createStub = sandbox.stub(User, "create").resolves(sampleUser);
    bcryptStub = sandbox.stub(bcrypt, "hash").resolves("hashedPassword");

    findOneStub = sandbox.stub(User, "findOne").returns(queryMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Register user", () => {
    it("should register a user with valid fields", async () => {
      findOneStub.resolves(null);
      findOneRoleStub.resolves({ _id: "roleId", name: "REVIEWER" });

      const result = await User.register(name, email, password);

      expect(result.email).to.equal(email);
      expect(result.name).to.equal(name);
    });

    it("should throw an error if any field is missing", async () => {
      try {
        await User.register("", email, password);
      } catch (err) {
        expect(err.message).to.equal("All field must be filled!");
      }

      try {
        await User.register(name, "", password);
      } catch (err) {
        expect(err.message).to.equal("All field must be filled!");
      }

      try {
        await User.register(name, email, "");
      } catch (err) {
        expect(err.message).to.equal("All field must be filled!");
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
});
