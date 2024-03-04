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
  return new Promise(async (resolve, reject) => {
    const stats = await fs.promises.stat(filePath);

    if (!stats.isFile()) {
      throw new Error("File does not exist");
    }

    if (stats.size === 0) {
      throw new Error("File is empty");
    }

    let fileCounter = 0;
    const fileNames: string[] = [];

    const stream = fs.createReadStream(filePath);
    let data: Buffer = Buffer.alloc(0);

    stream.on("data", (chunk: Buffer) => {
      data = Buffer.concat([data, chunk]);

      while (data.length >= chunkSizeInBytes) {
        const fileData = data.subarray(0, chunkSizeInBytes);
        const fileName = `${destination}_${fileCounter}`;

        createFileWithData(fileName, fileData);
        fileNames.push(fileName);
        data = data.subarray(chunkSizeInBytes);
        fileCounter++;
      }
    });

    stream.on("end", () => {
      if (data.length > 0) {
        const fileName = `${destination}_${fileCounter}`;
        createFileWithData(fileName, data);
        fileNames.push(fileName);
      }
      resolve(fileNames);
    });

    stream.on("error", (error) => {
      reject(error);
    });

    return fileNames;
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
