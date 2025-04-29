import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Mod from "../models/Mod.js";
import ModCategories from "../models/ModCategories.js";

const sandbox = sinon.createSandbox();

describe("Mod model test", () => {
  let modInput, uploadResult, uploadError, saveStub, updateStub, updateMod;
  const modId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439022");

  beforeEach(() => {
    modInput = {
      name: "Test Mod",
      previewPhoto: { secure_url: "dummy_url" },
      specification: {
        isDeluxe: false,
        link: "http://example.com",
        authorName: "Test Author",
      },
      categories: ["cat1", "cat2"],
    };

    saveStub = sandbox
      .stub(Mod, "create")
      .callsFake((obj) => Promise.resolve(obj));

    sandbox
      .stub(cloudinary.uploader, "upload_stream")
      .callsFake((options, callback) => {
        process.nextTick(() => callback(uploadError, uploadResult));
        return { end: sinon.stub() };
      });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createMod", () => {
    it("should successfully create a mod with a secure URL from Cloudinary", async () => {
      uploadResult = { secure_url: "secure_url_from_cloudinary" };
      uploadError = null;

      sandbox
        .stub(ModCategories, "find")
        .callsFake(async ({ "subCategory.slug": { $in: slugs } }) => {
          return slugs.map(() => ({
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439022"),
            name: "Tractor",
            subCategory: [
              { name: "Small", slug: "small" },
              { name: "Medium", slug: "medium" },
              { name: "Big", slug: "big" },
            ],
          }));
        });

      let mod = {
        name: "Test Mod",
        previewPhoto: { secure_url: "dummy_url" },
        specification: {
          isDeluxe: false,
          link: "http://example.com",
          authorName: "Test Author",
        },
        slugs: ["small", "medium"],
      };

      const result = await Mod.createMod(mod);

      expect(result.previewPhoto).to.equal(uploadResult.secure_url);
      expect(saveStub.calledOnce).to.be.true;
      expect(saveStub.firstCall.args[0]).to.deep.include({
        previewPhoto: uploadResult.secure_url,
        specification: modInput.specification,
      });
      expect(saveStub.firstCall.args[0].categories).to.be.an("array");
    });

    it("should throw an error if Cloudinary upload fails", async () => {
      uploadResult = null;
      uploadError = new Error("Upload failed");

      try {
        await Mod.createMod(modInput);
        expect.fail("Expected createMod to throw an error");
      } catch (err) {
        expect(err).to.equal(uploadError);
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
          { isDeluxe: !modBefore.specification.isDeluxe },
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
        expect(err.message).to.equal("Mod not found!");
      }
    });
  });
});
