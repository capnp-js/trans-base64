/* @flow */

import type { BytesR } from "@capnp-js/bytes";

import { create, getSubarray, setSubarray } from "@capnp-js/bytes";

import { EMPTY } from "../common";

import writeQuads from "./writeQuads";
import writeRemainder from "./writeRemainder";
import { ENCODE_CHUNK_ALIGNMENT_ERROR } from "./constant";

export default class TransformCore {
  remainder: BytesR;

  constructor() {
    this.remainder = EMPTY;
  }

  set(bytes: BytesR): string | Error {
    if (this.remainder.length !== 0 && bytes.length > 0) {
      return new Error(ENCODE_CHUNK_ALIGNMENT_ERROR);
    }

    if (bytes.length % 3) {
      const cut = bytes.length - (bytes.length % 3);
      const remainder = create(bytes.length - cut);
      setSubarray(
        getSubarray(cut, bytes.length, bytes),
        0,
        remainder,
      );
      this.remainder = remainder;
      return writeQuads(getSubarray(0, cut, bytes));
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
