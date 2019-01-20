/* @flow */

export { ENCODE_CHUNK_ALIGNMENT_ERROR } from "./encode/constant";

export { default as transEncode } from "./encode/transEncode";
export { default as transEncodeSync } from "./encode/transEncodeSync";
export { default as finishEncodeSync } from "./encode/finishEncodeSync";

export {
  DECODE_ILLEGAL_LENGTH_ERROR,
  DECODE_BUFFER_SIZE_ERROR,
  DECODE_BUFFER_ALIGNMENT_ERROR,
  DECODE_CHUNK_ALIGNMENT_ERROR,
} from "./decode/constant";

export { default as startDecodeSync } from "./decode/startDecodeSync";
export { default as transDecode } from "./decode/transDecode";
export { default as transDecodeSync } from "./decode/transDecodeSync";
