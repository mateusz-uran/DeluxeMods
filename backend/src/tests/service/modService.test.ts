import { expect } from 'chai';
import sinon from 'sinon';
import { afterEach, beforeEach, describe, it } from 'mocha';
import Mod from '../../models/Mod';
import {
  changeModStatus,
  checkIfModExists,
  createModWithPreviewPhoto,
  getPerSixMods,
  replacePreviewPhoto,
  updateModReviewId,
} from '../../service/mod.service';
import { createFakeMods, IFakeMod } from '../helpers/mods.helper';

describe('Mod service unit tests', () => {
  const sandbox = sinon.createSandbox();

  const arraySize = 6;
  const deluxeStatus = false;
  const publishedMod = true;
  const modCategory = 'small';

  const fakeTotalCount = 42;
  const mods: IFakeMod[] = createFakeMods(
    arraySize,
    deluxeStatus,
    publishedMod,
    [modCategory],
  );

  afterEach(() => sandbox.restore());

  describe('getPerSixMods', () => {
    beforeEach(() => {
      const leanStub = sandbox.stub().resolves(mods);
      const skipStub = sandbox.stub().returns({ lean: leanStub });
      const limitStub = sandbox.stub().returns({ skip: skipStub });
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const selectStub = sandbox.stub().returns({ sort: sortStub });
      sandbox.stub(Mod, 'find').returns({ select: selectStub } as any);

      sandbox.stub(Mod, 'countDocuments').resolves(fakeTotalCount);
    });

    it('should return last six mods', async () => {
      const page = 1;
      const result = await getPerSixMods({ page });

      expect(result.mods).to.have.lengthOf(arraySize);
      expect(result.totalCount).to.equal(fakeTotalCount);

      expect(result).to.deep.equal({
        mods,
        totalCount: fakeTotalCount,
      });
    });

    it('should return last six mods by category', async () => {
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

  describe('createModWithPreviewPhoto', () => {
    const fakeUrl = 'https://cloudinary.com/fake-image.jpg';
    const fakeSlug = 'john-doe-john-deere-6r';
    const fakeValidCategories = ['small'];

    const modInput = {
      name: 'John Deere 6R',
      previewPhoto: { buffer: Buffer.from('img') },
      specification: {
        link: 'https://some-random-url.com',
        modAuthor: 'John Doe',
      },
      categorySlugs: ['small'],
    };

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(Mod, 'create').resolvesArg(0);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should successfully create a mod', async () => {
      const fakeUpload = sandbox.stub().resolves(fakeUrl);
      const fakeCategories = sandbox.stub().resolves(fakeValidCategories);
      const fakeSlugCreated = sandbox.stub().returns(fakeSlug);

      const result = await createModWithPreviewPhoto(
        modInput,
        fakeUpload,
        fakeCategories,
        fakeSlugCreated,
      );

      expect(fakeUpload.calledOnceWithExactly(modInput.previewPhoto.buffer)).to
        .be.true;
      expect(fakeCategories.calledOnceWithExactly(modInput.categorySlugs)).to.be
        .true;
      expect(
        fakeSlugCreated.calledOnceWithExactly(
          modInput.name,
          modInput.specification.modAuthor,
        ),
      ).to.be.true;

      expect(result.previewPhoto).to.equal(fakeUrl);
      expect(result.categories).to.deep.equal(fakeValidCategories);
      expect(result.slug).to.equal(fakeSlug);
    });

    it('should throw an error if no valid categories are found', async () => {
      const fakeUpload = sandbox.stub().resolves(fakeUrl);
      const fakeCheckCategories = sandbox.stub().resolves([]);
      const fakeCreateSlug = sandbox.stub().returns(fakeSlug);

      try {
        await createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug,
        );
        throw new Error('Test failed — should have thrown');
      } catch (err) {
        expect(err.message).to.equal(
          'No valid subCategory slugs found for provided slugs.',
        );
      }
    });

    it('should throw an error if image upload fails', async () => {
      const fakeUpload = sandbox.stub().rejects(new Error('Upload failed'));
      const fakeCheckCategories = sandbox.stub();
      const fakeCreateSlug = sandbox.stub();

      try {
        await createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug,
        );
        throw new Error('Test failed — should have thrown');
      } catch (err) {
        expect(err.message).to.equal('Upload failed');
        expect(fakeCheckCategories.notCalled).to.be.true;
        expect(fakeCreateSlug.notCalled).to.be.true;
      }
    });
  });

  describe('changeModStatus', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should update only isPublished', async () => {
      const slug = 'some-mod';
      const updatedMod = { slug, isPublished: true, isDeluxe: false };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, 'findOneAndUpdate')
        .resolves(updatedMod);

      const result = await changeModStatus({
        modSlug: slug,
        isPublished: true,
      });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { slug },
          { isPublished: true },
          { new: true },
        ),
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it('should update only isDeluxe', async () => {
      const slug = 'another-mod';
      const updatedMod = { slug, isPublished: false, isDeluxe: true };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, 'findOneAndUpdate')
        .resolves(updatedMod);

      const result = await changeModStatus({ modSlug: slug, isDeluxe: true });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { slug },
          { isDeluxe: true },
          { new: true },
        ),
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it('should update both isPublished and isDeluxe', async () => {
      const slug = 'multi-change-mod';
      const updatedMod = { slug, isPublished: false, isDeluxe: false };

      const findOneAndUpdateStub = sandbox
        .stub(Mod, 'findOneAndUpdate')
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
          { new: true },
        ),
      ).to.be.true;

      expect(result).to.equal(updatedMod);
    });

    it('should throw an error when no fields are provided.', async () => {
      try {
        await changeModStatus({ modSlug: 'empty-change' });
        throw new Error('Test failed — should have thrown');
      } catch (err) {
        expect(err.message).to.equal(
          'At least one of isPublished or isDeluxe must be provided',
        );
      }
    });
  });

  describe('replacePreviewPhoto', () => {
    const oldUrl = 'http://old.com/image.png';
    const newUrl = 'http://new.com/image.png';
    const newPreviewPhoto = { buffer: Buffer.from('mock-buffer') };

    let dummyMod;
    let fakeFindMod;
    let fakeReplaceImage;

    beforeEach(() => {
      dummyMod = {
        _id: 'mod123',
        name: 'Some Mod',
        previewPhoto: oldUrl,
        save: sinon.stub().resolvesThis(),
      };

      fakeFindMod = sinon.stub().resolves(dummyMod);
      fakeReplaceImage = sinon.stub().resolves(newUrl);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should update preview photo and save mod', async () => {
      const result = await replacePreviewPhoto(
        {
          previewPhotoUrl: oldUrl,
          newPreviewPhoto,
        },
        fakeFindMod,
        fakeReplaceImage,
      );

      expect(fakeFindMod.calledOnceWithExactly(oldUrl)).to.be.true;
      expect(
        fakeReplaceImage.calledOnceWithExactly(oldUrl, newPreviewPhoto.buffer),
      ).to.be.true;
      expect(dummyMod.save.calledOnce).to.be.true;

      expect(result.previewPhoto).to.equal(newUrl);
      expect(result).to.deep.equal(dummyMod);
    });

    it('should throw an error when mod is not found', async () => {
      fakeFindMod.rejects(new Error('Mod not found'));

      try {
        await replacePreviewPhoto(
          {
            previewPhotoUrl: oldUrl,
            newPreviewPhoto,
          },
          fakeFindMod,
          fakeReplaceImage,
        );
        throw new Error('Test should not reach this point');
      } catch (err) {
        expect(err.message).to.equal('Mod not found');
      }
    });

    it('should throw when image replacement fails', async () => {
      fakeReplaceImage.rejects(new Error('Cloudinary error'));

      try {
        await replacePreviewPhoto(
          {
            previewPhotoUrl: oldUrl,
            newPreviewPhoto,
          },
          fakeFindMod,
          fakeReplaceImage,
        );
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.equal('Cloudinary error');
      }
    });

    it('should throw when mod.save fails', async () => {
      dummyMod.save.rejects(new Error('Mongo error'));

      try {
        await replacePreviewPhoto(
          {
            previewPhotoUrl: oldUrl,
            newPreviewPhoto,
          },
          fakeFindMod,
          fakeReplaceImage,
        );
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err.message).to.equal('Mongo error');
      }
    });
  });

  describe('findModByPreviewUrl', () => {
    const dummyMod = {
      name: 'Dummy mod',
      previewPhoto: 'http://random-url.com',
    };

    afterEach(() => {
      sandbox.restore();
    });

    it('should return single mod by previewPhoto url', async () => {
      sandbox.stub(Mod, 'findOne').resolves(dummyMod);

      const result = await findModByPreviewUrl(dummyMod.previewPhoto);
      expect(result).to.deep.equal(dummyMod);
    });

    it('should throw error when mod not found', async () => {
      sandbox.restore();
      sandbox.stub(Mod, 'findOne').resolves(null);

      try {
        await findModByPreviewUrl('http://wrong-url.com');
      } catch (error) {
        expect(error.message).to.equal('Mod not found');
      }
    });
  });

  describe('checkIfModExists', () => {
    const dummyMod = {
      _id: 'random_id',
      name: 'Dummy mod',
    };

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if mod exists', async () => {
      sandbox.stub(Mod, 'exists').resolves(dummyMod);

      const result = await checkIfModExists(dummyMod._id);
      expect(result).to.be.true;
    });

    it('should return false when mod not found', async () => {
      sandbox.stub(Mod, 'exists').resolves(null);

      const result = await checkIfModExists({ id: 'wrong mod ID' });
      expect(result).to.be.false;
    });

    describe('updateModReviewId', () => {
      let findOneAndUpdateStub;

      const reviewId = 'review_492';
      const mod = {
        _id: 'randomId',
        name: 'random mod',
        reviewId,
      };

      beforeEach(() => {
        findOneAndUpdateStub = sandbox
          .stub(Mod, 'findOneAndUpdate')
          .resolves(mod);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should update mod object with given review id', async () => {
        const result = await updateModReviewId(mod._id, reviewId);

        expect(
          findOneAndUpdateStub.calledOnceWithExactly(
            { _id: mod._id },
            { reviewId },
            { new: true },
          ),
        ).to.be.true;

        expect(result).to.deep.equal(mod);
      });

      it('should return null if mod with given ID does not exist', async () => {
        findOneAndUpdateStub.resolves(null);

        const result = await updateModReviewId('nonexistentId', 'someReviewId');

        expect(result).to.be.null;
      });

      it('should throw error if reviewId is already assigned to another mod', async () => {
        const duplicateKeyError = new Error('E11000 duplicate key error');
        findOneAndUpdateStub.rejects(duplicateKeyError);

        try {
          await updateModReviewId('someId', 'existingReviewId');
          throw new Error('Test failed – expected error was not thrown');
        } catch (err) {
          expect(err.message).to.include('duplicate key error');
        }
      });
    });
  });
});
