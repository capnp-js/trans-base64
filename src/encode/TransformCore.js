/* @flow */

import { EMPTY } from "../common";

import writeQuads from "./writeQuads";
import writeRemainder from "./writeRemainder";
import { ENCODE_CHUNK_ALIGNMENT_ERROR } from "./constant";

export default class TransformCore {
  remainder: Uint8Array;

  constructor() {
    this.remainder = EMPTY;
  }

  set(bytes: Uint8Array): string | Error {
    if (this.remainder.length !== 0 && bytes.length > 0) {
      return new Error(ENCODE_CHUNK_ALIGNMENT_ERROR);
    }

    if (bytes.length % 3) {
      const cut = bytes.length - (bytes.length % 3);
      this.remainder = bytes.slice(cut);
      return writeQuads(bytes.subarray(0, cut));
    } else {
      return writeQuads(bytes);
    }
  }

  finish(): string {
    const base64 = writeRemainder(this.remainder);
    this.remainder = EMPTY;
    return base64;
  }
}
