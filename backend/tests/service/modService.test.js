import { expect } from "chai";
import sinon from "sinon";
import Mod from "../../models/Mod.js";
import {
  changeModStatus,
  createModWithPreviewPhoto,
  getPerSixMods,
} from "../../service/mod.service.js";
import { createFakeMods } from "../helpers/mods.helper.js";

describe("Mod service unit tests", () => {
  const sandbox = sinon.createSandbox();

  const arraySize = 6;
  const deluxeStatus = false;
  const publishedMod = true;
  const modCategory = "small";

  const fakeTotalCount = 42;
  const mods = createFakeMods(arraySize, deluxeStatus, publishedMod, [
    modCategory,
  ]);

  afterEach(() => sandbox.restore());

  describe("getPerSixMods", () => {
    beforeEach(() => {
      const skipStub = sandbox.stub().resolves(mods);
      const limitStub = sandbox.stub().returns({ skip: skipStub });
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const selectStub = sandbox.stub().returns({ sort: sortStub });
      sandbox.stub(Mod, "find").returns({ select: selectStub });

      sandbox.stub(Mod, "countDocuments").resolves(fakeTotalCount);
    });

    it("should return last six mods", async () => {
      const page = 1;
      const result = await getPerSixMods({ page });

      expect(result.mods).to.have.lengthOf(arraySize);
      expect(result.totalCount).to.equal(fakeTotalCount);

      expect(result).to.deep.equal({
        mods,
        totalCount: fakeTotalCount,
      });
    });

    it("should return last six mods by category", async () => {
      const page = 1;
      const result = await getPerSixMods({
        subCategory: modCategory,
        page,
      });

      expect(result.mods).to.have.lengthOf(arraySize);
      expect(result.totalCount).to.equal(fakeTotalCount);

      expect(result).to.deep.equal({
        mods,
        totalCount: fakeTotalCount,
      });
    });
  });

  describe("createModWithPreviewPhoto", () => {
    const fakeUrl = "https://cloudinary.com/fake-image.jpg";
    const fakeSlug = "john-doe-john-deere-6r";
    const fakeValidCategories = ["small"];

    const modInput = {
      name: "John Deere 6R",
      previewPhoto: { buffer: Buffer.from("img") },
      specification: {
        link: "https://some-random-url.com",
        modAuthor: "John Doe",
      },
      categorySlugs: ["small"],
    };

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(Mod, "create").resolvesArg(0);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should successfully create a mod", async () => {
      const fakeUpload = sandbox.stub().resolves(fakeUrl);
      const fakeCategories = sandbox.stub().resolves(fakeValidCategories);
      const fakeSlugCreated = sandbox.stub().returns(fakeSlug);

      const result = await createModWithPreviewPhoto(
        modInput,
        fakeUpload,
        fakeCategories,
        fakeSlugCreated
      );

      expect(fakeUpload.calledOnceWithExactly(modInput.previewPhoto.buffer)).to
        .be.true;
      expect(fakeCategories.calledOnceWithExactly(modInput.categorySlugs)).to.be
        .true;
      expect(
        fakeSlugCreated.calledOnceWithExactly(
          modInput.name,
          modInput.specification.modAuthor
        )
      ).to.be.true;

      expect(result.previewPhoto).to.equal(fakeUrl);
      expect(result.categories).to.deep.equal(fakeValidCategories);
      expect(result.slug).to.equal(fakeSlug);
    });

    it("should throw an error if no valid categories are found", async () => {
      const fakeUpload = sandbox.stub().resolves(fakeUrl);
      const fakeCheckCategories = sandbox.stub().resolves([]);
      const fakeCreateSlug = sandbox.stub().returns(fakeSlug);

      try {
        await createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug
        );
        throw new Error("Test failed — should have thrown");
      } catch (err) {
        expect(err.message).to.equal(
          "No valid subCategory slugs found for provided slugs."
        );
      }
    });

    it("should throw an error if image upload fails", async () => {
      const fakeUpload = sandbox.stub().rejects(new Error("Upload failed"));
      const fakeCheckCategories = sandbox.stub();
      const fakeCreateSlug = sandbox.stub();

      try {
        await createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug
        );
        throw new Error("Test failed — should have thrown");
      } catch (err) {
        expect(err.message).to.equal("Upload failed");
        expect(fakeCheckCategories.notCalled).to.be.true;
        expect(fakeCreateSlug.notCalled).to.be.true;
      }
    });
  });

  describe("changeModStatus", () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should update only isPublished", async () => {
      const slug = "some-mod";
      const updatedMod = { slug, isPublished: true, isDeluxe: false };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, "findOneAndUpdate")
        .resolves(updatedMod);

      const result = await changeModStatus({
        modSlug: slug,
        isPublished: true,
      });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { slug },
          { isPublished: true },
          { new: true }
        )
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it("should update only isDeluxe", async () => {
      const slug = "another-mod";
      const updatedMod = { slug, isPublished: false, isDeluxe: true };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, "findOneAndUpdate")
        .resolves(updatedMod);

      const result = await changeModStatus({ modSlug: slug, isDeluxe: true });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { slug },
          { isDeluxe: true },
          { new: true }
        )
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it("should update both isPublished and isDeluxe", async () => {
      const slug = "multi-change-mod";
      const updatedMod = { slug, isPublished: false, isDeluxe: false };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, "findOneAndUpdate")
        .resolves(updatedMod);

      const result = await changeModStatus({
        modSlug: slug,
        isPublished: false,
        isDeluxe: false,
      });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { slug },
          { isPublished: false, isDeluxe: false },
          { new: true }
        )
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it("should throw an error when no fields are provided", async () => {
      try {
        await changeModStatus({ modSlug: "empty-change" });
        throw new Error("Test failed — should have thrown");
      } catch (err) {
        expect(err.message).to.equal(
          "At least one of isPublished or isDeluxe must be provided"
        );
      }
    });
  });
});
