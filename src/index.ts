/*!
 * file-split-join
 * Copyright (c) 2024 Vadym Yarema
 * MIT Licensed
 */

import fs from "fs";

/**
 * Splits a file into N parts.
 *
 * @param filePath - The path of the file to be split.
 * @param numberOfParts - The number of parts to split the file into.
 * @param destination - The destination path or paths where the split files will be created.
 * @returns A promise that resolves to an array of the split file names.
 * @throws An error if the file does not exist or is empty.
 */
export async function splitFileIntoParts(
  filePath: string,
  numberOfParts: number,
  destination: string
): Promise<string[]> {
  const stats = await fs.promises.stat(filePath);
  if (!stats.isFile()) {
    throw new Error("File does not exist");
  }
  if (stats.size === 0) {
    throw new Error("File is empty");
  }
  const chunkSizeInBytes = Math.ceil(stats.size / numberOfParts);

  if (chunkSizeInBytes < 1) {
    throw new Error("Chunk is less than 1 byte");
  }

  return splitFileByBytes(filePath, chunkSizeInBytes, destination);
}

/**
 * Splits a file into multiple chunks based on the specified chunk size in bytes.
 *
 * @param filePath - The path of the file to be split.
 * @param chunkSizeInBytes - The size of each chunk in bytes.
 * @param destination - The destination path or paths where the split files will be created.
 * @returns A promise that resolves to an array of the split file names.
 * @throws An error if the file does not exist or is empty.
 */
export async function splitFileByBytes(
  filePath: string,
  chunkSizeInBytes: number,
  destination: string
): Promise<string[]> {
  const stats = await fs.promises.stat(filePath);

  if (!stats.isFile()) {
    throw new Error("File does not exist");
  }

  if (stats.size === 0) {
    throw new Error("File is empty");
  }

  let fileCounter = 0;
  let currentChunkSize = 0;
  const fileNames: string[] = [];
  let currentWriteStream = fs.createWriteStream(
    `${destination}_${fileCounter}`
  );
  fileNames.push(`${destination}_${fileCounter}`);

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      highWaterMark: 1024 * 1024,
    });

    stream.on("data", (chunk: Buffer) => {
      let remainingChunk = chunk;
      while (remainingChunk.length > 0) {
        const remainingSpaceInCurrentChunk =
          chunkSizeInBytes - currentChunkSize;
        const lengthToWrite = Math.min(
          remainingChunk.length,
          remainingSpaceInCurrentChunk
        );
        currentWriteStream.write(remainingChunk.slice(0, lengthToWrite));

        remainingChunk = remainingChunk.slice(lengthToWrite);
        currentChunkSize += lengthToWrite;

        if (currentChunkSize === chunkSizeInBytes) {
          currentWriteStream.end();
          fileCounter++;
          currentChunkSize = 0;
          if (remainingChunk.length > 0) {
            currentWriteStream = fs.createWriteStream(
              `${destination}_${fileCounter}`
            );
            fileNames.push(`${destination}_${fileCounter}`);
          }
        }
      }
    });

    stream.on("end", () => {
      currentWriteStream.end();
      resolve(fileNames);
    });

    stream.on("error", (error) => {
      currentWriteStream.end();
      reject(error);
    });
  });
}

async function createFileWithData(
  fileName: string,
  data: Buffer
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Merges multiple files into one.
 *
 * @param fileNames - An array of file names to merge.
 * @param destination - The destination file path where the merged file will be saved.
 * @returns A Promise that resolves to the destination file path when the merge is complete.
 */
export async function mergeFilesIntoOne(
  fileNames: string[],
  destination: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const stream = fs.createWriteStream(destination);

    for await (const fileStream of readFileStreams(fileNames)) {
      await new Promise<void>((resolve, _reject) => {
        fileStream.pipe(stream, { end: false });
        fileStream.on("end", resolve);
        fileStream.on("error", reject);
      });
    }
    stream.on("finish", () => {
      resolve(destination);
    });
    stream.on("error", reject);

    stream.end();
  });
}

function* readFileStreams(fileNames: string[]): Generator<fs.ReadStream> {
  for (const fileName of fileNames) {
    yield fs.createReadStream(fileName);
  }
}
