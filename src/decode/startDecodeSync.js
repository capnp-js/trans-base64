/* @flow */

import type {
  Start,
  SugarlessIteratorResult,
  SugarlessIterator,
} from "@capnp-js/transform";

import {
  a2b,
  DECODE_BUFFER_SIZE_ERROR,
  DECODE_BUFFER_ALIGNMENT_ERROR,
  DECODE_ILLEGAL_LENGTH_ERROR,
} from "./constant";

/* This base-64 decoder doesn't bother with trailing "=" padding. */

export default function startDecodeSync(buffer: Uint8Array): Start<string, Uint8Array> {
  if (buffer.length < 3) {
    throw new Error(DECODE_BUFFER_SIZE_ERROR);
  }

  if (buffer.length % 3) {
    throw new Error(DECODE_BUFFER_ALIGNMENT_ERROR);
  }

  const chunkLength = buffer.length / 3 * 4;

  return function start(base64: string): SugarlessIterator<Uint8Array> {
    let i = 0;
    const overallQuadsEnd = base64.length - (base64.length % 4);
    let error = null;
    return {
      next(): SugarlessIteratorResult<Uint8Array> {
        if (error !== null) {
          return { done: error };
        }

        if (i === base64.length) {
          return { done: true };
        }

        // #if _DEBUG
        console.log("\n***** next() beginning *****");
        // #endif

        const quadsEnd = Math.min(overallQuadsEnd, i + chunkLength);
        let bufferI = 0;
        while (i < quadsEnd) {
          // #if _DEBUG
          console.log(`fast path: i=${i} of ${quadsEnd}`);
          // #endif

          let quad = a2b[base64.charCodeAt(i++)] << 18;
          quad |= a2b[base64.charCodeAt(i++)] << 12;
          quad |= a2b[base64.charCodeAt(i++)] << 6;
          quad |= a2b[base64.charCodeAt(i++)];

          buffer[bufferI++] = (quad >> 16) & 0xff;
          buffer[bufferI++] = (quad >> 8) & 0xff;
          buffer[bufferI++] = quad & 0xff;
        }

        if (bufferI < buffer.length) {
          switch (base64.length - i) {
          case 0:
            // #if _DEBUG
            console.log("there's residual buffer space, but no residual characters");
            // #endif

            break;
          case 1:
            // #if _DEBUG
            console.log("found an illegal residual of 1");
            // #endif

            error = new Error(DECODE_ILLEGAL_LENGTH_ERROR);
            return { done: error };
          case 2: {
            // #if _DEBUG
            console.log("found a residual of 2");
            // #endif

            let pair = a2b[base64.charCodeAt(i++)] << 2;
            pair |= a2b[base64.charCodeAt(i++)] >> 4;

            buffer[bufferI++] = pair & 0xff;
            break;
          }
          default: {
            // #if _DEBUG
            console.log("found a residual of 3");
            // #endif

            let triple = a2b[base64.charCodeAt(i++)] << 10;
            triple |= a2b[base64.charCodeAt(i++)] << 4;
            triple |= a2b[base64.charCodeAt(i++)] >> 2;

            buffer[bufferI++] = (triple >> 8) & 0xff;
            buffer[bufferI++] = triple & 0xff;
          }
          }
        }

        return {
          done: false,
          value: buffer.subarray(0, bufferI),
        };
      },
    };
  };
}
