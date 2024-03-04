import fs from "fs";
import { splitFileIntoParts, mergeFilesIntoOne } from "../src"; // Adjust the import path based on your structure

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
},10000);
