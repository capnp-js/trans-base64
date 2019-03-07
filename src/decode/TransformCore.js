/* @flow */

import type { BytesR, BytesB } from "@capnp-js/bytes";
import type { SugarlessIteratorResult } from "@capnp-js/transform";

import type { StringCursor } from "../common";

import { getSubarray, set } from "@capnp-js/bytes";

import {
  a2b,
  DECODE_BUFFER_SIZE_ERROR,
  DECODE_BUFFER_ALIGNMENT_ERROR,
  DECODE_CHUNK_ALIGNMENT_ERROR,
  DECODE_ILLEGAL_LENGTH_ERROR,
} from "./constant";

type uint = number;

/* This base-64 decoder doesn't bother with trailing "=" padding. */

export default class TransformCore {
  +buffer: BytesB;
  +bufferPreimageLength: uint;
  base64: StringCursor;
  remainder: string;

  constructor(buffer: BytesB) {
    if (buffer.length < 3) {
      throw new Error(DECODE_BUFFER_SIZE_ERROR);
    }

    if (buffer.length % 3) {
      throw new Error(DECODE_BUFFER_ALIGNMENT_ERROR);
    }

    this.buffer = buffer;
    this.bufferPreimageLength = buffer.length / 3 * 4;
    this.base64 = {
      string: "",
      i: 0,
    };
    this.remainder = "";
  }

  set(base64: string): void {
    this.base64 = {
      string: base64,
      i: 0,
    };
  }

  next(): SugarlessIteratorResult<BytesR> {
    // #if _DEBUG
    console.log("\n***** next() beginning *****");
    // #endif

    if (this.remainder.length !== 0) {
      return { done: new Error(DECODE_CHUNK_ALIGNMENT_ERROR) };
    }

    if (this.base64.i === this.base64.string.length) {
      return { done: true };
    }

    // #if _DEBUG
    console.log(`this.base64.i=${this.base64.i} of ${this.base64.string.length}`);
    // #endif
    if (this.base64.i === 6 && this.base64.string.length === 2) {
      throw new Error();
    }

    const availableChars = this.base64.string.length - this.base64.i;
    const availableQuadChars = availableChars - (availableChars % 4);
    const end = this.base64.i + Math.min(this.bufferPreimageLength, availableQuadChars);
    let i = 0;
    while (this.base64.i < end) {
      let quad = a2b[this.base64.string.charCodeAt(this.base64.i++)] << 18;
      quad |= a2b[this.base64.string.charCodeAt(this.base64.i++)] << 12;
      quad |= a2b[this.base64.string.charCodeAt(this.base64.i++)] << 6;
      quad |= a2b[this.base64.string.charCodeAt(this.base64.i++)];

      set((quad >> 16) & 0xff, i++, this.buffer);
      set((quad >> 8) & 0xff, i++, this.buffer);
      set(quad & 0xff, i++, this.buffer);
    }

    if (availableChars % 4) {
      /* The `this.bufferPreimageLength` is necessarily chunk-word aligned, so a
         misaligned `end` implies that (1) `availableChars` controlled within
         the `Math.min` and (2) `availableChars` was not chunk-word aligned. */
      this.remainder = this.base64.string.slice(this.base64.i);
      this.base64.i += availableChars % 4;
    }

    return {
      done: false,
      value: getSubarray(0, i, this.buffer),
    };
  }

  flush(): SugarlessIteratorResult<BytesR> {
    // #if _DEBUG
    console.log("\n***** flush() beginning *****");
    // #endif

    switch (this.remainder.length) {
    case 0:
      return { done: true };
    case 1:
      return { done: new Error(DECODE_ILLEGAL_LENGTH_ERROR) };
    case 2: {
      let pair = a2b[this.remainder.charCodeAt(0)] << 2;
      pair |= a2b[this.remainder.charCodeAt(1)] >> 4;
      set(pair & 0xff, 0, this.buffer);

      this.remainder = "";

      return {
        done: false,
        value: getSubarray(0, 1, this.buffer),
      };
    }
    default: {
      let triple = a2b[this.remainder.charCodeAt(0)] << 10;
      triple |= a2b[this.remainder.charCodeAt(1)] << 4;
      triple |= a2b[this.remainder.charCodeAt(2)] >> 2;

      set((triple >> 8) & 0xff, 0, this.buffer);
      set(triple & 0xff, 1, this.buffer);

      this.remainder = "";

      return {
        done: false,
        value: getSubarray(0, 2, this.buffer),
      };
    }
    }
  }
}
