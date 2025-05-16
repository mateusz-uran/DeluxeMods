import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import Mod from "../models/Mod.js";
import ModCategories from "../models/ModCategories.js";

describe("Mod model test", () => {
  const sandbox = sinon.createSandbox();
  const modId = new mongoose.Types.ObjectId();
  const modSlug = "random-dude-mod-name-85aE";
  const page = 1,
    limit = 5;

  afterEach(() => sandbox.restore());

  describe("createMod", () => {
    let createStub, categoryFindStub;
    const modInput = {
      name: "Test Mod",
      previewPhoto: { buffer: Buffer.from("img") },
      specification: { isDeluxe: false, link: "x", modAuthor: "A" },
      slugs: ["small", "medium"],
      slug: modSlug,
    };

    beforeEach(() => {
      createStub = sandbox.stub(Mod, "create").resolvesArg(0);
      categoryFindStub = sandbox.stub(ModCategories, "find").resolves([
        {
          subCategory: [
            { name: "Small", slug: "small" },
            { name: "Medium", slug: "medium" },
          ],
        },
      ]);
    });

    it("should successfully create a mod with Cloudinary upload", async () => {
      const fakeUpload = sandbox.stub().resolves("url123");

      const result = await Mod.createMod(modInput, fakeUpload);

      expect(fakeUpload.calledOnceWithExactly(modInput.previewPhoto.buffer)).to
        .be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(result.previewPhoto).to.equal("url123");
      expect(result.categories).to.deep.equal(["small", "medium"]);
    });

    it("should throw if upload fails", async () => {
      const fakeUpload = sandbox.stub().rejects(new Error("fail"));
      try {
        await Mod.createMod(modInput, fakeUpload);
        expect.fail("Expected createMod to throw");
      } catch (err) {
        expect(err.message).to.equal("fail");
      }
    });

    it("should throw if no matching slugs", async () => {
      categoryFindStub.resolves([]);
      const fakeUpload = sandbox.stub().resolves("url");
      try {
        await Mod.createMod(modInput, fakeUpload);
        expect.fail("Expected createMod to throw");
      } catch (err) {
        expect(err.message).to.match(/No valid subCategory slugs/);
      }
    });
  });

  describe("getSingleMod", () => {
    beforeEach(() => {
      sandbox.stub(Mod, "findOne").returns({
        select: sandbox.stub().resolves({
          _id: modId,
          name: "Test Mod",
          specification: { isDeluxe: true, link: "L", modAuthor: "A" },
          categories: ["small"],
        }),
      });
    });

    it("should return single mod", async () => {
      const result = await Mod.getSingleMod({
        modSlug,
      });
      expect(result.specification).to.deep.equal({
        isDeluxe: true,
        link: "L",
        modAuthor: "A",
      });
    });

    it("should throw error when slug not provided", async () => {
      try {
        await Mod.getSingleMod({ modSlug: null });
        expect.fail("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Mod slug must be provided!");
      }
    });

    it("should throw error mod not found", async () => {
      sandbox.restore();
      sandbox
        .stub(Mod, "findOne")
        .returns({ select: sandbox.stub().resolves(null) });

      try {
        await Mod.getSingleMod({ modSlug });
        expect.fail("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Mod not found!");
      }
    });
  });

  describe("updateModSpecification", () => {
    const spec = { link: "L", modAuthor: "A", isDeluxe: true };
    beforeEach(() => {
      sandbox.stub(Mod, "findOne").returns({
        select: sandbox.stub().resolves({
          _id: modId,
          name: "Test Mod",
          specification: { modAuthor: "A" },
        }),
      });

      sandbox.stub(Mod, "findByIdAndUpdate").returns({
        select: sandbox.stub().resolves({ specification: spec }),
      });
    });

    it("should update specification and return selected fields", async () => {
      const result = await Mod.updateModSpecification({
        modSlug,
        specification: spec,
      });
      expect(result.specification).to.deep.equal(spec);
    });

    it("should throw if mod not found", async () => {
      sandbox.restore();
      sandbox
        .stub(Mod, "findOne")
        .returns({ select: sandbox.stub().resolves(null) });

      try {
        await Mod.updateModSpecification({ modSlug, specification: spec });
        expect.fail("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Mod not found!");
      }
    });
  });

  describe("getLastTenPublishedMods", () => {
    const fakeMods = Array.from({ length: 10 }, (_, i) => ({
      name: `M${i}`,
      previewPhoto: `u${i}`,
      specification: { isDeluxe: false },
      isPublished: true,
    }));
    beforeEach(() => {
      const limitStub = sandbox.stub().resolves(fakeMods);
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const selectStub = sandbox.stub().returns({ sort: sortStub });
      sandbox.stub(Mod, "find").returns({ select: selectStub });
    });

    it("should query with filter and projection, sort & limit", async () => {
      const result = await Mod.getLastTenPublishedMods();
      expect(result).to.deep.equal(fakeMods);
    });
  });

  describe("getModsNotPublishedPagingAndSorting", () => {
    const fakeMods = Array.from({ length: limit }, (_, i) => ({
      name: `M${i}`,
      isPublished: false,
    }));
    beforeEach(() => {
      const sortStub = sandbox.stub().resolves(fakeMods);
      const skipStub = sandbox.stub().returns({ sort: sortStub });
      const limitStub = sandbox.stub().returns({ skip: skipStub });
      const selectStub = sandbox.stub().returns({ limit: limitStub });
      sandbox.stub(Mod, "find").returns({ select: selectStub });
    });

    it("should paginate, project, and sort unpublished mods", async () => {
      const result = await Mod.getModsNotPublishedPagingAndSorting({
        page,
        limit,
      });
      expect(result).to.deep.equal(fakeMods);
    });
  });

  describe("getModsByCategorie", () => {
    const fakeMods = Array.from({ length: limit }, (_, i) => ({
      name: `M${i}`,
      isPublished: true,
    }));
    beforeEach(() => {
      const sortStub = sandbox.stub().resolves(fakeMods);
      const skipStub = sandbox.stub().returns({ sort: sortStub });
      const limitStub = sandbox.stub().returns({ skip: skipStub });
      const selectStub = sandbox.stub().returns({ limit: limitStub });
      sandbox.stub(Mod, "find").returns({ select: selectStub });
    });

    it("should filter by slug, project, paginate, and sort", async () => {
      const result = await Mod.getModsByCategorie({
        subCategory: "baler",
        page,
        limit,
      });
      expect(result).to.deep.equal(fakeMods);
    });
  });

  describe("getModByParameters", () => {
    const limit = 5;
    const page = 1;

    const fakeMods = Array.from({ length: limit }, (_, i) => ({
      name: `M${i}`,
      isPublished: true,
    }));

    beforeEach(() => {
      const sortStub = sinon.stub().resolves(fakeMods);
      const skipStub = sinon.stub().returns({ sort: sortStub });
      const limitStub = sinon.stub().returns({ skip: skipStub });
      const selectStub = sinon.stub().returns({ limit: limitStub });
      sinon.stub(Mod, "find").returns({ select: selectStub });
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should build query with isDeluxe and category", async () => {
      const result = await Mod.getModByParameters({
        isDeluxe: true,
        subCategory: ["baler"],
        page,
        limit,
      });

      expect(result).to.deep.equal(fakeMods);
    });

    it("should build query with only isDeluxe", async () => {
      const result = await Mod.getModByParameters({
        isDeluxe: false,
        subCategory: [],
        page,
        limit,
      });

      expect(result).to.deep.equal(fakeMods);
    });
  });

  describe("updateModDeluxeStatus", () => {
    const modId = new mongoose.Types.ObjectId();

    afterEach(() => sandbox.restore());

    it("should toggle and return selected fields", async () => {
      sandbox
        .stub(Mod, "findById")
        .resolves({ specification: { isDeluxe: false } });

      const selectStub = sandbox.stub().resolves({
        _id: modId,
        name: "Test",
        specification: { isDeluxe: true },
      });
      sandbox
        .stub(Mod, "findByIdAndUpdate")
        .withArgs(
          modId,
          { $set: { "specification.isDeluxe": true } },
          { new: true }
        )
        .returns({ select: selectStub });

      const result = await Mod.updateModDeluxeStatus({ modId });

      expect(
        selectStub.calledOnceWithExactly("_id name specification.isDeluxe")
      ).to.be.true;
      expect(result.specification.isDeluxe).to.be.true;
    });

    it("should throw if mod not found", async () => {
      sandbox.stub(Mod, "findById").resolves(null);

      try {
        await Mod.updateModDeluxeStatus({ modId });
        expect.fail("Expected error");
      } catch (err) {
        expect(err.message).to.equal(
          "Error while updating mod: Mod not found!"
        );
      }
    });
  });

  describe("updatePreviewPhoto", () => {
    const modId = new mongoose.Types.ObjectId();
    const buffer = Buffer.from("img-data");
    const previewPhoto = { buffer };

    afterEach(() => sandbox.restore());

    it("should upload and return selected fields", async () => {
      const fakeUpload = sandbox.stub().resolves("new_url");

      const selectStub = sandbox.stub().resolves({
        _id: modId,
        name: "Test",
        previewPhoto: "new_url",
      });
      sandbox
        .stub(Mod, "findByIdAndUpdate")
        .withArgs(modId, { previewPhoto: "new_url" }, { new: true })
        .returns({ select: selectStub });

      const result = await Mod.updatePreviewPhoto(
        { modId, previewPhoto },
        fakeUpload
      );

      expect(fakeUpload.calledOnceWithExactly(buffer)).to.be.true;
      expect(selectStub.calledOnceWithExactly("_id name previewPhoto")).to.be
        .true;
      expect(result.previewPhoto).to.equal("new_url");
    });

    it("should throw if update returns null", async () => {
      const fakeUpload = sandbox.stub().resolves("new_url");

      const selectStub = sandbox.stub().resolves(null);
      sandbox.stub(Mod, "findByIdAndUpdate").returns({ select: selectStub });

      try {
        await Mod.updatePreviewPhoto({ modId, previewPhoto }, fakeUpload);
        expect.fail("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Mod not found!");
      }
    });
  });
});
