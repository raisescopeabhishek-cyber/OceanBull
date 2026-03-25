// scripts/fix-import-casing.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const EXTS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
const CODE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (CODE_EXTS.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function list(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return null;
  }
}

function matchCaseInsensitive(dir, name) {
  const entries = list(dir);
  if (!entries) return null;
  const lower = name.toLowerCase();
  return entries.find((e) => e.toLowerCase() === lower) ?? null;
}

// Try to resolve an import path and return a corrected (cased) import path.
// Only handles relative paths (./ ../). Leaves npm package imports untouched.
function fixRelativeImport(fromFile, spec) {
  if (!spec.startsWith("./") && !spec.startsWith("../")) return null;

  const fromDir = path.dirname(fromFile);
  const rawParts = spec.split("/");

  // Build actual path segments by matching directory entries case-insensitively
  let cur = fromDir;
  const outParts = [];

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (part === "." || part === "") {
      outParts.push(part);
      continue;
    }
    if (part === "..") {
      cur = path.resolve(cur, "..");
      outParts.push("..");
      continue;
    }

    // For last segment, it might be file or folder
    const isLast = i === rawParts.length - 1;

    // Match directory entry by name (or basename) ignoring case
    const entries = list(cur);
    if (!entries) return null;

    // If last and has extension already, match exact filename by case-insensitive
    if (isLast && path.extname(part)) {
      const m = entries.find((e) => e.toLowerCase() === part.toLowerCase());
      if (!m) return null;
      outParts.push(m);
      return outParts.join("/");
    }

    // If last and no extension, try:
    // 1) match a folder of that name (then index.*)
    // 2) match a file with allowed extensions
    if (isLast) {
      // folder match
      const folder = entries.find((e) => e.toLowerCase() === part.toLowerCase() && fs.existsSync(path.join(cur, e)) && fs.statSync(path.join(cur, e)).isDirectory());
      if (folder) {
        // keep folder casing
        outParts.push(folder);
        const idxDir = path.join(cur, folder);
        const idxEntries = list(idxDir) || [];
        const indexFile = idxEntries.find((e) => {
          const ext = path.extname(e);
          return e.toLowerCase().startsWith("index.") && EXTS.includes(ext);
        });
        if (indexFile) {
          // Keep import as folder path (no need to append /index)
          return outParts.join("/");
        }
        // folder exists but no index file; still return corrected folder casing
        return outParts.join("/");
      }

      // file match with extension
      const file = entries.find((e) => {
        const ext = path.extname(e);
        const base = path.basename(e, ext);
        return base.toLowerCase() === part.toLowerCase() && EXTS.includes(ext);
      });
      if (!file) return null;

      // Keep original “no extension” import (Vite supports it), but fix the casing of basename
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      outParts.push(base);
      return outParts.join("/");
    }

    // Middle segment must be directory-ish; match by name ignoring case
    const matched = matchCaseInsensitive(cur, part);
    if (!matched) return null;

    outParts.push(matched);
    cur = path.join(cur, matched);
  }

  return null;
}

function rewriteImports(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Handles:
  // import X from "..."
  // import("...")
  // require("...")  (optional)
  const pattern =
    /(\bimport\s+[^;]*?\s+from\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)["']([^"']+)["'](\s*\)?)/g;

  const out = src.replace(pattern, (full, prefix, spec, suffix) => {
    const fixed = fixRelativeImport(filePath, spec);
    if (fixed && fixed !== spec) {
      changed = true;
      return `${prefix}"${fixed}"${suffix}`;
    }
    return full;
  });

  if (changed) fs.writeFileSync(filePath, out, "utf8");
  return changed;
}

const files = walk(ROOT);
let touched = 0;

for (const f of files) {
  if (rewriteImports(f)) touched++;
}

console.log(`✅ Fixed casing in imports for ${touched} file(s).`);
