import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import Mod from "../models/Mod.js";
import ModCategories from "../models/ModCategories.js";
import * as cloudinaryUtil from "../utils/cloudinaryUpload.util.js";

const sandbox = sinon.createSandbox();

describe("Mod model test", () => {
  let modInput, saveStub, updateStub, updateMod, uploadStub, findStub;
  const modId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439022");

  beforeEach(() => {
    modInput = {
      name: "Test Mod",
      previewPhoto: { buffer: Buffer.from("fake-image") },
      specification: {
        isDeluxe: false,
        link: "http://example.com",
        authorName: "Test Author",
      },
      slugs: ["small", "medium"],
    };

    saveStub = sandbox
      .stub(Mod, "create")
      .callsFake((obj) => Promise.resolve(obj));

    findStub = sandbox.stub(ModCategories, "find").callsFake(async () => [
      {
        name: "Some category",
        subCategory: [
          { name: "Small", slug: "small" },
          { name: "Medium", slug: "medium" },
        ],
      },
    ]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createMod", () => {
    it("should successfully create a mod with Cloudinary upload", async () => {
      const fakeUpload = sandbox.stub().resolves("fake_secure_url");

      const result = await Mod.createMod(modInput, fakeUpload);

      sinon.assert.calledOnceWithExactly(
        fakeUpload,
        modInput.previewPhoto.buffer
      );

      sinon.assert.calledOnce(saveStub);
      const saved = saveStub.firstCall.args[0];
      expect(saved.previewPhoto).to.equal("fake_secure_url");
      expect(saved.categories).to.deep.equal(["small", "medium"]);
    });

    it("should throw an error if Cloudinary upload fails", async () => {
      const fakeUpload = sandbox.stub().rejects(new Error("Upload failed"));

      try {
        await Mod.createMod(modInput, fakeUpload);
        expect.fail("Expected createMod to throw an error");
      } catch (err) {
        expect(err.message).to.equal("Upload failed");
      }
    });

    it("should throw an error if no category slugs match", async () => {
      findStub.resolves([]);
      const fakeUpload = sandbox.stub().resolves("whatever");

      try {
        await Mod.createMod(modInput, fakeUpload);
        expect.fail("Expected createMod to throw an error");
      } catch (err) {
        expect(err.message).to.equal(
          "No valid subCategory slugs found for provided slugs."
        );
      }
    });
  });

  describe("updateModText", () => {
    it("should return updated mod", async () => {
      updateMod = new Mod({
        _id: modId,
        previewPhoto: "",
        specification: {
          isDeluxe: false,
          link: "http://update-link.com",
          modAuthor: "John Doe",
        },
        isPublished: true,
        categories: [new mongoose.Types.ObjectId()],
      });

      updateStub = sandbox.stub(Mod, "findByIdAndUpdate").resolves(updateMod);

      const spec = {
        isDeluxe: true,
        link: "http://update-link.com",
        modAuthor: "John Doe",
      };

      const result = await Mod.updateModSpecification({
        modId,
        specification: spec,
      });

      expect(result.specification.link).to.equal("http://update-link.com");
      expect(result.specification.modAuthor).to.equal("John Doe");
    });
  });

  describe("getLastTenPublishedMods", () => {
    it("should return last 10 created mods with isPublished=true", async () => {
      const fakeMods = Array.from({ length: 10 }, (_, i) => ({
        name: `Mod ${i}`,
        previewPhoto: `url_${i}`,
        specification: { isDeluxe: false },
        categories: [],
        createdAt: new Date(Date.now() - i * 1000),
        isPublished: true,
      }));

      const findStub = sandbox.stub(Mod, "find").returns({
        sort: sandbox.stub().returnsThis(),
        limit: sandbox.stub().returns(Promise.resolve(fakeMods)),
      });

      const result = await Mod.getLastTenPublishedMods();

      expect(
        findStub.calledOnceWithExactly(
          { isPublished: true },
          "name previewPhoto specification.isDeluxe"
        )
      ).to.be.true;

      expect(result).to.be.an("array").that.has.lengthOf(10);
      expect(result[0].name).to.equal("Mod 0");
    });
  });

  describe("getModsNotPublishedPagingAndSorting", () => {
    it("should return unpublished mods paginated and sorted", async () => {
      const page = 1;
      const limit = 5;
      const fakeMods = Array.from({ length: limit }, (_, i) => ({
        name: `Mod ${i}`,
        isPublished: false,
        createdAt: new Date(Date.now() - i * 1000),
      }));

      const findStub = sandbox.stub(Mod, "find").returns({
        limit: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        sort: sandbox.stub().returns(Promise.resolve(fakeMods)),
      });

      const result = await Mod.getModsNotPublishedPagingAndSorting({
        page,
        limit,
      });

      expect(result).to.be.an("array").with.lengthOf(limit);
      expect(findStub.calledOnceWithExactly({ isPublished: false })).to.be.true;
    });
  });

  describe("getModsByCategories", () => {
    const categoryId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
    const page = 1;
    const limit = 5;

    it("should return sorted not published mods", async () => {
      const fakeMods = Array.from({ length: limit }, (_, i) => ({
        name: `Mod ${i}`,
        isPublished: true,
        categories: ["baler"],
        createdAt: new Date(Date.now() - i * 1000),
      }));

      sandbox.stub(Mod, "find").returns({
        limit: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        sort: sandbox.stub().returns(Promise.resolve(fakeMods)),
      });

      const result = await Mod.getModsByCategorie({
        subCategory: "Baler",
        page,
        limit,
      });

      expect(result).to.be.an("array").that.has.lengthOf(limit);
      expect(result[0].name).to.equal("Mod 0");
      expect(result[0].isPublished).to.equal(true);
    });
  });

  describe("getModByParameters", () => {
    const categoryId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
    const page = 1;
    const limit = 5;

    it("should return mods with isDeluxe=true, isPublished=true and category", async () => {
      sandbox.stub(ModCategories, "find").resolves([
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Bailing",
          subCategory: [
            { name: "Baler", slug: "baler" },
            { name: "Wrapper", slug: "wrapper" },
          ],
        },
      ]);

      const fakeMods = Array.from({ length: limit }, (_, i) => ({
        name: `Mod ${i}`,
        isPublished: true,
        specification: { isDeluxe: true },
        categories: [categoryId],
        createdAt: new Date(Date.now() - i * 1000),
      }));

      sandbox.stub(Mod, "find").returns({
        limit: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        sort: sandbox.stub().returns(Promise.resolve(fakeMods)),
      });

      const result = await Mod.getModByParameters({
        subCategory: "Baler",
        page,
        limit,
      });

      expect(result).to.be.an("array").that.has.lengthOf(limit);
      expect(result[0].name).to.equal("Mod 0");
      expect(result[0].isPublished).to.equal(true);
      expect(result[0].specification.isDeluxe).to.equal(true);
    });

    it("should return mods with isDeluxe=false, isPublished=false and without assigned category", async () => {
      sandbox.stub(ModCategories, "find").resolves([
        {
          _id: categoryId,
          name: "Bailing",
          subCategory: ["Baler", "Wrapper"],
        },
      ]);

      const fakeMods = Array.from({ length: limit }, (_, i) => ({
        name: `Mod ${i}`,
        isPublished: false,
        specification: { isDeluxe: false },
        categories: [],
        createdAt: new Date(Date.now() - i * 1000),
      }));

      sandbox.stub(Mod, "find").returns({
        limit: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        sort: sandbox.stub().returns(Promise.resolve(fakeMods)),
      });

      const result = await Mod.getModByParameters({
        subCategory: "Baler",
        page,
        limit,
      });

      expect(result).to.be.an("array").that.has.lengthOf(limit);
      expect(result[0].name).to.equal("Mod 0");
      expect(result[0].isPublished).to.equal(false);
      expect(result[0].specification.isDeluxe).to.equal(false);
    });
  });

  describe("updateModDeluxeStatus", () => {
    const modId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");

    it("should toggle the isDeluxe status and return the updated mod", async () => {
      const modBefore = {
        _id: modId,
        specification: {
          isDeluxe: false,
        },
      };

      const modAfter = {
        _id: modId,
        specification: {
          isDeluxe: true,
        },
      };

      const findByIdStub = sandbox.stub(Mod, "findById").resolves(modBefore);
      const findByIdAndUpdateStub = sandbox
        .stub(Mod, "findByIdAndUpdate")
        .resolves(modAfter);

      const result = await Mod.updateModDeluxeStatus({ modId });

      expect(findByIdStub.calledOnceWith(modId)).to.be.true;
      expect(
        findByIdAndUpdateStub.calledOnceWith(
          modId,
          { $set: { "specification.isDeluxe": true } },
          { new: true }
        )
      ).to.be.true;

      expect(result).to.deep.equal(modAfter);
    });

    it("should throw an error if the mod is not found", async () => {
      sandbox.stub(Mod, "findById").resolves(null);

      try {
        await Mod.updateModDeluxeStatus({ modId });
        expect.fail("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal(
          "Error while updating mod: Mod not found!"
        );
      }
    });
  });
});
