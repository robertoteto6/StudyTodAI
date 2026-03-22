import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = ["app", "components"].map((segment) => path.join(root, segment));
const allowText = new Set(["StudyTodAI", "404"]);
const allowedFileNames = new Set(["not-found.tsx"]);
const fileExtensions = new Set([".tsx", ".jsx"]);
const issues = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!fileExtensions.has(path.extname(entry.name))) {
      continue;
    }

    scanFile(fullPath);
  }
}

function scanFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/);
  const relativePath = path.relative(root, filePath);
  const allowFileText = allowedFileNames.has(path.basename(filePath));

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const match of line.matchAll(/>([^<{]+)</g)) {
      const value = match[1].trim();
      if (shouldIgnoreText(value, allowFileText)) {
        continue;
      }

      issues.push(`${relativePath}:${index + 1}: visible text literal "${value}"`);
    }

    for (const match of line.matchAll(/\b(?:placeholder|title|aria-label)=["']([^"']+)["']/g)) {
      const value = match[1].trim();
      if (shouldIgnoreText(value, allowFileText)) {
        continue;
      }

      issues.push(`${relativePath}:${index + 1}: hardcoded prop literal "${value}"`);
    }
  }
}

function shouldIgnoreText(value, allowFileText) {
  if (!value) {
    return true;
  }

  if (allowText.has(value) || (allowFileText && allowText.has(value))) {
    return true;
  }

  if (/[{}]/.test(value)) {
    return true;
  }

  if (/^[^A-Za-zÀ-ÿ0-9]+$/.test(value)) {
    return true;
  }

  return false;
}

for (const directory of targets) {
  if (statSync(directory, { throwIfNoEntry: false })?.isDirectory()) {
    walk(directory);
  }
}

if (issues.length) {
  console.error("Hardcoded UI literals detected outside dictionaries:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("No hardcoded UI literals detected.");
