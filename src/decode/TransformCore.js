/* @flow */

import type { SugarlessIteratorResult } from "@capnp-js/transform";

import type { StringCursor } from "../common";

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
  +buffer: Uint8Array;
  +bufferPreimageLength: uint;
  base64: StringCursor;
  remainder: string;

  constructor(buffer: Uint8Array) {
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

  next(): SugarlessIteratorResult<Uint8Array> {
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

      this.buffer[i++] = (quad >> 16) & 0xff;
      this.buffer[i++] = (quad >> 8) & 0xff;
      this.buffer[i++] = quad & 0xff;
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
      value: this.buffer.subarray(0, i),
    };
  }

  flush(): SugarlessIteratorResult<Uint8Array> {
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
      this.buffer[0] = pair & 0xff;

      this.remainder = "";

      return {
        done: false,
        value: this.buffer.subarray(0, 1),
      };
    }
    default: {
      let triple = a2b[this.remainder.charCodeAt(0)] << 10;
      triple |= a2b[this.remainder.charCodeAt(1)] << 4;
      triple |= a2b[this.remainder.charCodeAt(2)] >> 2;

      this.buffer[0] = (triple >> 8) & 0xff;
      this.buffer[1] = triple & 0xff;

      this.remainder = "";

      return {
        done: false,
        value: this.buffer.subarray(0, 2),
      };
    }
    }
  }
}
