import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const MAX_CATALOG_IMAGE_BYTES = 20 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export class CatalogImageValidationError extends Error {}

export const getCatalogImageDirectory = () =>
  path.resolve(process.env.IMAGE_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'catalog'));

export const persistCatalogImage = async (image: string): Promise<string> => {
  if (!image.startsWith('data:')) {
    return image.startsWith('/uploads/catalog/')
      ? image.replace('/uploads/catalog/', '/api/uploads/catalog/')
      : image;
  }

  const match = /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(image);
  if (!match) {
    throw new CatalogImageValidationError('Catalog images must be valid base64 JPEG, PNG, WebP, GIF, or AVIF images.');
  }

  const mimeType = match[1];
  const encodedContents = match[2];
  if (encodedContents.length > Math.ceil(MAX_CATALOG_IMAGE_BYTES / 3) * 4) {
    throw new CatalogImageValidationError('Catalog images must be smaller than 20 MB.');
  }
  const contents = Buffer.from(encodedContents, 'base64');
  if (contents.length === 0 || contents.length > MAX_CATALOG_IMAGE_BYTES) {
    throw new CatalogImageValidationError('Catalog images must be smaller than 20 MB.');
  }

  const filename = `${createHash('sha256').update(contents).digest('hex')}.${MIME_EXTENSIONS[mimeType]}`;
  const directory = getCatalogImageDirectory();
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(path.join(directory, filename), contents, { flag: 'wx' });
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') {
      throw error;
    }
  }

  return `/api/uploads/catalog/${filename}`;
};

export const persistCatalogImages = async (images: string[]): Promise<string[]> =>
  Promise.all(images.map(persistCatalogImage));
