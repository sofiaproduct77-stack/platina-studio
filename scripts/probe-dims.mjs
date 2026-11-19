import sharp from "sharp";
import { readdir } from "fs/promises";
import path from "path";

const dirs = [
  "C:\\Users\\dtro2\\Projects\\STUDIOS\\Platina\\assets\\img",
  "C:\\Users\\dtro2\\.cursor\\projects\\c-Users-dtro2-KACH-GORILLA\\assets",
];

for (const dir of dirs) {
  console.log("\n===", dir, "===");
  const files = (await readdir(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  for (const f of files.sort()) {
    const meta = await sharp(path.join(dir, f)).metadata();
    console.log(`${f}\t${meta.width}x${meta.height}\t${meta.format}`);
  }
}