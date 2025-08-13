import Mod from '../../models/Mod';
import {
  changeModStatus,
  checkIfModExists,
  createModWithPreviewPhoto,
  getPerSixMods,
  replacePreviewPhoto,
  updateModReviewId,
} from '../../service/mod.service';
import { createFakeMods, FakeMod } from '../helpers/mods.helper';
import {
  ChangeModStatusOutput,
  CreateModInput,
} from '../../interfaces/mod.interface';
import { Types } from 'mongoose';

import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  MockInstance,
} from 'vitest';

describe('Mod service unit tests', () => {
  const arraySize = 6;
  const deluxeStatus = false;
  const publishedMod = true;
  const modCategory = 'small';

  const fakeTotalCount = 42;
  const mods: FakeMod[] = createFakeMods(
    arraySize,
    deluxeStatus,
    publishedMod,
    [modCategory],
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPerSixMods', () => {
    beforeEach(() => {
      const leanMock = vi.fn().mockResolvedValue(mods);
      const skipMock = vi.fn().mockReturnValue({ lean: leanMock });
      const limitMock = vi.fn().mockReturnValue({ skip: skipMock });
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
      const selectMock = vi.fn().mockReturnValue({ sort: sortMock });
      vi.spyOn(Mod, 'find').mockReturnValue({ select: selectMock } as any);

      vi.spyOn(Mod, 'countDocuments').mockResolvedValue(fakeTotalCount);
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

    const modInput: CreateModInput = {
      name: 'John Deere 6R',
      previewPhoto: {
        buffer: Buffer.from('img'),
      } as Express.Multer.File,
      specification: {
        link: 'https://some-random-url.com',
        modAuthor: 'John Doe',
      },
      categorySlugs: ['small'],
    };

    beforeEach(() => {
      vi.spyOn(Mod, 'create').mockResolvedValue({
        name: modInput.name,
        previewPhoto: fakeUrl,
        specification: modInput.specification,
        categories: fakeValidCategories,
        slug: fakeSlug,
      } as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should successfully create a mod', async () => {
      const fakeUpload = vi.fn().mockResolvedValue(fakeUrl);
      const fakeCategories = vi.fn().mockResolvedValue(fakeValidCategories);
      const fakeSlugCreated = vi.fn().mockResolvedValue(fakeSlug);

      const result = await createModWithPreviewPhoto(
        modInput,
        fakeUpload,
        fakeCategories,
        fakeSlugCreated,
      );

      expect(fakeUpload).toHaveBeenCalledOnce();
      expect(fakeUpload).toHaveBeenCalledWith(modInput.previewPhoto.buffer);

      expect(fakeCategories).toHaveBeenCalledOnce();
      expect(fakeCategories).toHaveBeenCalledWith(modInput.categorySlugs);

      expect(fakeSlugCreated).toHaveBeenCalledOnce();
      expect(fakeSlugCreated).toHaveBeenCalledWith(
        modInput.name,
        modInput.specification.modAuthor,
      );

      expect(result.previewPhoto).toBe(fakeUrl);
      expect(result.categories).toEqual(fakeValidCategories);
      expect(result.slug).toBe(fakeSlug);
    });

    it('should throw an error if no valid categories are found', async () => {
      const fakeUpload = vi.fn().mockResolvedValue(fakeUrl);
      const fakeCheckCategories = vi.fn().mockResolvedValue([]);
      const fakeCreateSlug = vi.fn().mockReturnValue(fakeSlug);

      await expect(
        createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug,
        ),
      ).rejects.toThrow('No valid subCategory slugs found for provided slugs.');
    });

    it('should throw an error if image upload fails', async () => {
      const fakeUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
      const fakeCheckCategories = vi.fn();
      const fakeCreateSlug = vi.fn();

      await expect(
        createModWithPreviewPhoto(
          modInput,
          fakeUpload,
          fakeCheckCategories,
          fakeCreateSlug,
        ),
      ).rejects.toThrow('Upload failed');

      expect(fakeCheckCategories).not.toHaveBeenCalled();
      expect(fakeCreateSlug).not.toHaveBeenCalled();
    });
  });

  describe('changeModStatus', () => {
    beforeEach(() => {});

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should update only isPublished', async () => {
      const slug = 'some-mod';
      const updatedMod: ChangeModStatusOutput = {
        slug,
        name: 'Test mod',
        isPublished: true,
        isDeluxe: false,
      };

      const leanMock = vi.fn().mockResolvedValue(updatedMod);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      const findOneAndUpdateMock = vi
        .spyOn(Mod, 'findOneAndUpdate')
        .mockReturnValue({ select: selectMock } as any);

      const result = await changeModStatus({
        slug,
        isPublished: true,
      });

      expect(findOneAndUpdateMock).toBeCalledWith(
        { slug },
        { isPublished: true },
        { new: true },
      );

      expect(result).toBe(updatedMod);
    });

    it('should update only isDeluxe', async () => {
      const slug = 'another-mod';
      const updatedMod: ChangeModStatusOutput = {
        slug,
        name: 'Test mod',
        isPublished: false,
        isDeluxe: true,
      };

      const leanMock = vi.fn().mockResolvedValue(updatedMod);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      const findOneAndUpdateStub = vi
        .spyOn(Mod, 'findOneAndUpdate')
        .mockReturnValue({ select: selectMock } as any);

      const result = await changeModStatus({ slug, isDeluxe: true });

      expect(findOneAndUpdateStub).toBeCalledWith(
        { slug },
        { isDeluxe: true },
        { new: true },
      );

      expect(result).toBe(updatedMod);
    });

    it('should update both isPublished and isDeluxe', async () => {
      const slug = 'multi-change-mod';
      const updatedMod: ChangeModStatusOutput = {
        slug,
        name: 'Mod C',
        isPublished: false,
        isDeluxe: false,
      };

      const leanMock = vi.fn().mockResolvedValue(updatedMod);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      const findOneAndUpdateMock = vi
        .spyOn(Mod, 'findOneAndUpdate')
        .mockReturnValue({ select: selectMock } as any);

      const result = await changeModStatus({
        slug,
        isPublished: false,
        isDeluxe: false,
      });

      expect(findOneAndUpdateMock).toBeCalledWith(
        { slug },
        { isPublished: false, isDeluxe: false },
        { new: true },
      );

      expect(result).toBe(updatedMod);
    });

    it('should throw an error when no fields are provided.', async () => {
      await expect(changeModStatus({ slug: 'empty-change' })).rejects.toThrow(
        'At least one of isPublished or isDeluxe must be provided.',
      );
    });
  });

  describe('replacePreviewPhoto', () => {
    const oldUrl = 'http://old.com/image.png';
    const newUrl = 'http://new.com/image.png';
    const newPreviewPhoto = {
      buffer: Buffer.from('mock-buffer'),
    } as Express.Multer.File;

    let dummyMod: any;
    let fakeFindMod: Mock;
    let fakeReplaceImage: Mock;

    beforeEach(() => {
      dummyMod = {
        _id: 'mod123',
        name: 'Some Mod',
        previewPhoto: oldUrl,
        save: vi.fn(),
      };

      fakeFindMod = vi.fn().mockResolvedValue(dummyMod);
      fakeReplaceImage = vi.fn().mockResolvedValue(newUrl);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should update preview photo and save mod', async () => {
      const result = await replacePreviewPhoto(
        {
          modId: dummyMod._id,
          newPreviewPhoto,
        },
        { findMod: fakeFindMod, reuoploadImage: fakeReplaceImage },
      );

      expect(fakeFindMod).toHaveBeenCalledOnce();
      expect(fakeFindMod).toHaveBeenCalledWith(dummyMod._id);

      expect(fakeReplaceImage).toHaveBeenCalledOnce();
      expect(fakeReplaceImage).toHaveBeenCalledWith(
        oldUrl,
        newPreviewPhoto.buffer,
      );

      expect(dummyMod.save).toHaveBeenCalledOnce();

      expect(result).toEqual({
        _id: dummyMod._id,
        previewPhotoUrl: newUrl,
      });
    });

    it('should throw an error when mod is not found', async () => {
      fakeFindMod.mockRejectedValue(new Error('Mod not found'));

      await expect(
        replacePreviewPhoto(
          { modId: dummyMod._id, newPreviewPhoto },
          { findMod: fakeFindMod, reuoploadImage: fakeReplaceImage },
        ),
      ).rejects.toThrow('Mod not found');
    });

    it('should throw when image replacement fails', async () => {
      fakeReplaceImage.mockRejectedValue(new Error('Cloudinary error'));

      await expect(
        replacePreviewPhoto(
          { modId: dummyMod._id, newPreviewPhoto },
          { findMod: fakeFindMod, reuoploadImage: fakeReplaceImage },
        ),
      ).rejects.toThrow('Cloudinary error');
    });

    it('should throw when mod.save fails', async () => {
      dummyMod.save.mockRejectedValue(new Error('Mongo error'));

      await expect(
        replacePreviewPhoto(
          { modId: dummyMod._id, newPreviewPhoto },
          { findMod: fakeFindMod, reuoploadImage: fakeReplaceImage },
        ),
      ).rejects.toThrow('Mongo error');
    });
  });

  describe('checkIfModExists', () => {
    const dummyId = new Types.ObjectId();

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if mod exists', async () => {
      vi.spyOn(Mod, 'exists').mockResolvedValue({ _id: dummyId });

      const result = await checkIfModExists(dummyId.toString());
      expect(result).toBe(true);
    });

    it('should return false when mod not found', async () => {
      vi.spyOn(Mod, 'exists').mockResolvedValue(null);

      const result = await checkIfModExists('wrong mod ID');
      expect(result).toBe(false);
    });
  });

  describe('updateModReviewId', () => {
    let findOneAndUpdateMock: MockInstance;

    const reviewId = new Types.ObjectId();
    const mod = {
      _id: '507f191e810c19729de860ea',
      name: 'random mod',
      reviewId,
    };

    beforeEach(() => {
      findOneAndUpdateMock = vi
        .spyOn(Mod, 'findOneAndUpdate')
        .mockResolvedValue({ _id: mod._id, reviewId });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should update mod object with given review id', async () => {
      await updateModReviewId(mod._id, reviewId);

      expect(findOneAndUpdateMock).toHaveBeenCalledOnce();
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { _id: mod._id },
        { reviewId },
        { new: true },
      );
    });

    it('should return null if mod with given ID does not exist', async () => {
      findOneAndUpdateMock.mockResolvedValue(null);

      let error: unknown;
      try {
        await updateModReviewId('nonexistentId', 'someReviewId');
      } catch (err) {
        error = err;
      }

      expect(error).toBeUndefined();
      expect(findOneAndUpdateMock).toHaveBeenCalledOnce();
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { _id: 'nonexistentId' },
        { reviewId: 'someReviewId' },
        { new: true },
      );
    });

    it('should throw error if reviewId is already assigned to another mod', async () => {
      const duplicateKeyError = new Error('E11000 duplicate key error');
      findOneAndUpdateMock.mockRejectedValue(duplicateKeyError);

      await expect(
        updateModReviewId('someId', 'existingReviewId'),
      ).rejects.toThrow(/duplicate key error/);
    });
  });
});
