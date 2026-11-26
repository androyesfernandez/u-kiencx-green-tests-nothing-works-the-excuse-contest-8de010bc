import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { join } from "node:path";

// The entry: one line, 110 characters, no trailing newline.
const LINE =
  "The app works perfectly for the user in the fixtures, and real users are an edge case we have not prioritized.";

function validate(line: string): void {
  if (line.length < 1 || line.length > 140) {
    throw new Error(`entry must be 1-140 characters, got ${line.length}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of line) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`entry contains a control character (U+${code.toString(16).padStart(4, "0")})`);
    }
    if (code > 0x7f) {
      throw new Error("entry must be plain ASCII");
    }
  }
  if (Buffer.byteLength(line, "utf8") !== line.length) {
    throw new Error("entry byte length differs from character length");
  }
}

function main(): void {
  validate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("verification failed: entry.txt does not match the line byte-for-byte");
  }
  console.log(`Wrote ${LINE.length} characters (${Buffer.byteLength(LINE, "utf8")} bytes) to ${outPath}`);
}

main();
