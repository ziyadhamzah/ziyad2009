// Regenerates supabase/seed.sql from lib/products.ts.
// Usage: node scripts/gen-seed.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const src = readFileSync(resolve(root, "lib/products.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const tmp = resolve(root, ".seed-products.cjs");
writeFileSync(tmp, js);
const { products, categories } = require(tmp);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const catSlug = (c) => c.toLowerCase().replace(/\s+/g, "-");

const lines = [];
lines.push("-- AUTO-GENERATED dari lib/products.ts. Regenerate: node scripts/gen-seed.mjs");
lines.push("-- Jalankan SETELAH schema.sql di SQL Editor Supabase.");
lines.push("");
lines.push("insert into categories (name, slug) values");
lines.push(categories.map((c) => `  (${q(c)}, ${q(catSlug(c))})`).join(",\n"));
lines.push("on conflict (slug) do update set name = excluded.name;");
lines.push("");
lines.push("insert into products (category_id, slug, name, description, price, stock, sold, rating, image_urls) values");
lines.push(products.map((p) => {
  const img = p.image ? `array[${q(p.image)}]` : "array[]::text[]";
  return `  ((select id from categories where slug = ${q(catSlug(p.category))}), ${q(p.slug)}, ${q(p.name)}, ${q(p.description)}, ${p.price}, ${p.stock}, ${p.sold}, ${p.rating}, ${img})`;
}).join(",\n"));
lines.push("on conflict (slug) do update set");
lines.push("  category_id = excluded.category_id, name = excluded.name, description = excluded.description,");
lines.push("  price = excluded.price, stock = excluded.stock, sold = excluded.sold, rating = excluded.rating, image_urls = excluded.image_urls;");
lines.push("");
const withVariants = products.filter((p) => p.variants?.length);
if (withVariants.length) {
  lines.push("delete from product_variants where product_id in (select id from products);");
  lines.push("insert into product_variants (product_id, label, stock) values");
  lines.push(withVariants.map((p) => p.variants.map((v) => `  ((select id from products where slug = ${q(p.slug)}), ${q(v.label)}, 0)`).join(",\n")).join(",\n"));
  lines.push(";");
  lines.push("");
}

mkdirSync(resolve(root, "supabase"), { recursive: true });
writeFileSync(resolve(root, "supabase/seed.sql"), lines.join("\n"));
require("node:fs").unlinkSync(tmp);
console.log(`seed.sql ditulis: ${products.length} produk, ${categories.length} kategori, ${withVariants.length} produk bervarian.`);
