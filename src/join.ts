import fs from "fs";

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
