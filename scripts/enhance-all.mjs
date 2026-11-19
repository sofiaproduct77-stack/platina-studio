import sharp from "sharp";
import { copyFile, mkdir, readdir, rename, unlink } from "fs/promises";
import path from "path";

const OUT_DIR = path.resolve("assets/img");
const SRC_ASSETS = path.join(OUT_DIR, "_src");
const BACKUP_DIR = path.join(OUT_DIR, "_orig");

const WORK_SOURCES = [
  "image-24c81699-9070-45a5-867c-9f33fc20ecbe.png",
  "image-cd9f8ebb-8720-4234-8708-616bb4ea6989.png",
  "image-ddc2cc6f-c6e0-4ddc-b09e-5ed3c9f288e7.png",
  "image-69cd46a6-5b0f-43e8-9d2b-38c0960f5e2c.png",
  "image-bae25834-fa6b-48eb-8a34-a6d3dc101718.png",
  "image-be976c93-e87a-4571-bffb-b2c51ae5c523.png",
  "image-a19a9ae1-a08c-4680-bb70-e150d6296645.png",
  "image-e834d915-e803-4258-89a2-d6a4612c16a4.png",
];

const HERO_SOURCES = {
  "hero-main": "image-c0f8053f-f9b7-4e78-8263-8121955ce043.png",
  "hero-makeup": "image-6aa4b192-dec6-4778-910f-41dbe7f2d6f0.png",
  "hero-hair": "image-e404af63-7839-4c2d-9235-4a25acc980f2.png",
};

async function enhanceFile(inputPath, outputPath, { minLongEdge = 1400 } = {}) {
  const img = sharp(inputPath, { failOn: "none" });
  const meta = await img.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Bad image: ${inputPath}`);
  }

  const long = Math.max(meta.width, meta.height);
  let pipeline = sharp(inputPath);

  if (long < minLongEdge) {
    const scale = minLongEdge / long;
    const w = Math.round(meta.width * scale);
    const h = Math.round(meta.height * scale);
    pipeline = pipeline.resize(w, h, {
      kernel: sharp.kernel.lanczos3,
    });
  }

  pipeline = pipeline
    .sharpen({ sigma: 0.85, m1: 1.1, m2: 0.5, x1: 2, y2: 8, y3: 16 })
    .modulate({ brightness: 1.02, saturation: 1.05 });

  const ext = path.extname(outputPath).toLowerCase();
  const tmpPath = `${outputPath}.tmp`;
  const outOpts =
    ext === ".png"
      ? { png: { compressionLevel: 6, effort: 10, palette: false } }
      : { jpeg: { quality: 98, mozjpeg: true, chromaSubsampling: "4:4:4" } };

  if (outOpts.png) {
    await pipeline.png(outOpts.png).toFile(tmpPath);
  } else {
    await pipeline.jpeg(outOpts.jpeg).toFile(tmpPath);
  }

  if (path.resolve(outputPath) === path.resolve(inputPath)) {
    await unlink(outputPath);
  }
  await rename(tmpPath, outputPath);

  const outMeta = await sharp(outputPath).metadata();
  console.log(
    `OK ${path.basename(outputPath)}: ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}`,
  );
}

async function backupExisting(fileName) {
  const src = path.join(OUT_DIR, fileName);
  try {
    await copyFile(src, path.join(BACKUP_DIR, fileName));
  } catch {
    /* no prior file */
  }
}

await mkdir(BACKUP_DIR, { recursive: true });

for (let i = 0; i < WORK_SOURCES.length; i++) {
  const name = `work-${i + 1}.jpg`;
  await backupExisting(name);
  await backupExisting(`work-${i + 1}.png`);
  await enhanceFile(path.join(SRC_ASSETS, WORK_SOURCES[i]), path.join(OUT_DIR, name), {
    minLongEdge: 1800,
  });
}

for (const [base, srcName] of Object.entries(HERO_SOURCES)) {
  const out = path.join(OUT_DIR, `${base}.jpg`);
  await backupExisting(`${base}.jpg`);
  await backupExisting(`${base}.png`);
  await enhanceFile(path.join(SRC_ASSETS, srcName), out, { minLongEdge: 1920 });
}

const siteJpegs = (await readdir(OUT_DIR)).filter(
  (f) => /\.jpe?g$/i.test(f) && !f.startsWith("work-") && !f.startsWith("hero-"),
);

for (const f of siteJpegs) {
  if (["test.jpg", "test2.jpg", "test3.jpg"].includes(f)) continue;
  await backupExisting(f);
  await enhanceFile(path.join(OUT_DIR, f), path.join(OUT_DIR, f), {
    minLongEdge: 1600,
  });
}

console.log("\nDone. Hero + work saved as JPEG; other JPGs re-encoded.");