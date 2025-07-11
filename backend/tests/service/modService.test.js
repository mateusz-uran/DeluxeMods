import { expect } from "chai";
import sinon from "sinon";
import Mod from "../../models/Mod.js";
import { getPerSixMods } from "../../service/mod.service.js";
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
});
