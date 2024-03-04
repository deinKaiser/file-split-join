# file-split-join

A Node.js library for splitting files into manageable parts and merging them back into a single file. Designed for efficiency and ease of use, `file-split-join` supports handling large files without loading them entirely into memory.

## Features

- **Split Files**: Split large files into smaller parts based on size or number of parts.
- **Merge Files**: Easily merge multiple files back into the original file format.
- **Stream-based Processing**: Utilizes Node.js streams to efficiently handle large files.

## Installation

Install `file-split-join` using npm:

```bash
npm install file-split-join
```

Or using yarn:

```bash
yarn add file-split-join
```

## Usage

### Splitting a File

Split a file into multiple parts:

```javascript
import { splitFileIntoParts } from 'file-split-join';

const filePath = 'path/to/your/largeFile.txt';
const destination = 'path/to/output/prefix'; // Output files will be named as prefix_0, prefix_1, ...
const numberOfParts = 4; // Number of parts to split the file into

splitFileIntoParts(filePath, numberOfParts, destination)
  .then((parts) => {
    console.log(`File was split into ${parts.length} parts:`, parts);
  })
  .catch((error) => {
    console.error('Error splitting file:', error);
  });
```

### Merging Files

Merge multiple files back into a single file:

```javascript
import { mergeFilesIntoOne } from 'file-split-join';

const fileNames = ['path/to/output/prefix_0', 'path/to/output/prefix_1', ...];
const destination = 'path/to/output/mergedFile.txt';

mergeFilesIntoOne(fileNames, destination)
  .then((mergedFilePath) => {
    console.log(`Files were merged into: ${mergedFilePath}`);
  })
  .catch((error) => {
    console.error('Error merging files:', error);
  });
```

## API Reference

### `splitFileIntoParts(filePath, numberOfParts, destination)`

- `filePath`: String - The path of the file to be split.
- `numberOfParts`: Number - The number of parts to split the file into.
- `destination`: String - The destination path or paths where the split files will be created.

Returns: `Promise<string[]>` - A promise that resolves to an array of the split file names.

### `splitFileByBytes(filePath, chunkSizeInBytes, destination)`

Splits a file into multiple parts based on a specified chunk size in bytes.

- `filePath`: String - The path of the file to be split.
- `chunkSizeInBytes`: Number - The size of each chunk in bytes.
- `destination`: String - The base path or filename prefix for the split files. Split parts will be named as `<destination>_<index>`, where `<index>` is a zero-based index of the split part.

Returns: `Promise<string[]>` - A promise that resolves to an array of filenames for the split parts.

### `mergeFilesIntoOne(fileNames, destination)`

- `fileNames`: String[] - An array of file names to merge.
- `destination`: String - The destination file path where the merged file will be saved.

Returns: `Promise<string>` - A promise that resolves to the destination file path when the merge is complete.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
