import dotenv from 'dotenv';
import path from 'path';
import { RowDataPacket } from 'mysql2';
import { pool } from '../src/db';
import { getCatalogImageDirectory, persistCatalogImage, persistCatalogImages } from '../backend/services/catalog-images';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

interface CatalogImageRow extends RowDataPacket {
  id: string;
  image: string;
  galleryImages: string[] | string | null;
}

const parseGalleryImages = (value: CatalogImageRow['galleryImages']): string[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(image => typeof image === 'string')) {
    throw new Error('A catalog record contains an invalid gallery image list.');
  }
  return parsed;
};

const migrateTable = async (
  table: 'products' | 'business_posts',
  imageColumn: 'image',
  galleryColumn: 'gallery_images'
) => {
  const batchSize = 25;
  let offset = 0;
  let migrated = 0;

  while (true) {
    const [rows] = await pool.query<CatalogImageRow[]>(
      `SELECT id, ${imageColumn} AS image, ${galleryColumn} AS galleryImages
       FROM ${table} ORDER BY id LIMIT ? OFFSET ?`,
      [batchSize, offset]
    );
    if (rows.length === 0) break;

    for (const row of rows) {
      const image = await persistCatalogImage(row.image);
      const originalGalleryImages = parseGalleryImages(row.galleryImages);
      const galleryImages = await persistCatalogImages(originalGalleryImages);
      const galleryUnchanged = galleryImages.length === originalGalleryImages.length &&
        galleryImages.every((item, index) => item === originalGalleryImages[index]);
      if (image === row.image && galleryUnchanged) {
        continue;
      }

      await pool.query(
        `UPDATE ${table} SET ${imageColumn} = ?, ${galleryColumn} = ? WHERE id = ?`,
        [image, JSON.stringify(galleryImages), row.id]
      );
      migrated += 1;
    }

    offset += rows.length;
  }

  console.log(`${table}: ${migrated} records updated.`);
};

const main = async () => {
  try {
    await migrateTable('products', 'image', 'gallery_images');
    await migrateTable('business_posts', 'image', 'gallery_images');
    console.log(`Catalog image files are stored in ${getCatalogImageDirectory()}.`);
  } finally {
    await pool.end();
  }
};

main().catch(error => {
  console.error('Catalog image migration failed:', error);
  process.exitCode = 1;
});
