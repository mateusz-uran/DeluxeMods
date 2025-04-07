import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Mod from "../models/Mod.js";

const sandbox = sinon.createSandbox();

describe("Mod model test", () => {
  let modInput, uploadResult, uploadError, saveStub;
  beforeEach(() => {
    modInput = {
      name: "Test Mod",
      previewPhoto: { secure_url: "dummy_url" },
      specification: {
        isDeluxe: false,
        name: "Test Specification",
        link: "http://example.com",
        authorName: "Test Author",
      },
      categories: [new mongoose.Types.ObjectId()],
    };
    saveStub = sandbox
      .stub(Mod, "create")
      .callsFake((obj) => Promise.resolve(obj));

    uploadStub = sandbox
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
      const result = await Mod.createMod(modInput);

      expect(result.previewPhoto).to.equal(uploadResult.secure_url);
      expect(saveStub.calledOnce).to.be.true;
      expect(saveStub.firstCall.args[0]).to.deep.include({
        name: modInput.name,
        previewPhoto: uploadResult.secure_url,
        specification: modInput.specification,
        categories: modInput.categories,
      });
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
});
