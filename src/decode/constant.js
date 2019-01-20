/* @flow */

export const DECODE_ILLEGAL_LENGTH_ERROR =
  "Base 64 decode encountered a string of length 4n+1 where n is a natural number.";

export const DECODE_BUFFER_SIZE_ERROR =
  "Base 64 decode buffers require a length of at least 3 bytes.";

export const DECODE_BUFFER_ALIGNMENT_ERROR =
  "Base 64 decode buffers require a length aligned for 3 byte words.";

export const DECODE_CHUNK_ALIGNMENT_ERROR =
  "Base 64 decode chunks require a length aligned for 4 character words.";

export const a2b = new Uint8Array([
  -1, -1, -1, -1,   -1, -1, -1, -1,   -1, -1, -1, -1,   -1, -1, -1, -1,
  -1, -1, -1, -1,   -1, -1, -1, -1,   -1, -1, -1, -1,   -1, -1, -1, -1,
  -1, -1, -1, -1,   -1, -1, -1, -1,   -1, -1, -1, 62,   -1, -1, -1, 63,
  52, 53, 54, 55,   56, 57, 58, 59,   60, 61, -1, -1,   -1,  0, -1, -1,
  -1,  0,  1,  2,    3,  4,  5,  6,    7,  8,  9, 10,   11, 12, 13, 14,
  15, 16, 17, 18,   19, 20, 21, 22,   23, 24, 25, -1,   -1, -1, -1, -1,
  -1, 26, 27, 28,   29, 30, 31, 32,   33, 34, 35, 36,   37, 38, 39, 40,
  41, 42, 43, 44,   45, 46, 47, 48,   49, 50, 51, -1,   -1, -1, -1, -1,
]);