import fs from "fs";
import {
  splitFileIntoParts,
  mergeFilesIntoOne,
  splitFileByBytes,
} from "../src";

const mocksPath = "./__tests__/mocks/";
const testFileName = "test";
const testFilePath = `${mocksPath}${testFileName}`;
const destination = "./__tests__/output/";
const mergedFileName = "merged_test";
const mergedFilePath = `${destination}${mergedFileName}`;

beforeAll(() => {
  // Setup: Ensure the output directory exists
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
});

afterAll(() => {
  // Cleanup: Remove the output directory and its contents
  fs.rmSync(destination, { recursive: true, force: true });
});

test("split and merge file", async () => {
  // Split the file
  const splitFiles = await splitFileIntoParts(
    testFilePath,
    2,
    `${destination}part`
  );
  expect(splitFiles.length).toBe(2); // Expecting 2 parts based on the mock file and chunk size

  // Merge the file
  const mergedFile = await mergeFilesIntoOne(splitFiles, mergedFilePath);
  expect(mergedFile).toBe(mergedFilePath);

  // Verify the merged file content matches the original
  const originalContent = fs.readFileSync(testFilePath, { encoding: "utf8" });
  const mergedContent = fs.readFileSync(mergedFilePath, { encoding: "utf8" });
  expect(originalContent).toBe(mergedContent);
});

test("handling non-existent files", async () => {
  await expect(
    splitFileIntoParts("nonexistent.txt", 2, destination)
  ).rejects.toThrow(
    "ENOENT: no such file or directory, stat 'nonexistent.txt'"
  );
});

test("split and merge with small chunk size", async () => {
  const chunkSize = 1; // Very small chunk size to test edge cases
  const splitFiles = await splitFileByBytes(
    testFilePath,
    chunkSize,
    `${destination}small_chunk_part`
  );
  // In this case, number of files should be equal to file size if chunkSize is 1 byte
  const stats = fs.statSync(testFilePath);
  expect(splitFiles.length).toBe(stats.size);

  const mergedFile = await mergeFilesIntoOne(
    splitFiles,
    `${destination}merged_small_chunk`
  );
  const originalContent = fs.readFileSync(testFilePath, { encoding: "utf8" });
  const mergedContent = fs.readFileSync(mergedFile, { encoding: "utf8" });
  expect(originalContent).toBe(mergedContent);
});
