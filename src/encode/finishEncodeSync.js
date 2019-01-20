/* @flow */

import type { SugarlessIterator } from "@capnp-js/transform";

import { EMPTY } from "../common";

import writeQuads from "./writeQuads";
import writeRemainder from "./writeRemainder";
import { ENCODE_CHUNK_ALIGNMENT_ERROR } from "./constant";

/* This base-64 encoder doesn't bother with trailing "=" padding. */

export default function finishEncodeSync(source: SugarlessIterator<Uint8Array>): string | Error {
  let base64 = "";
  let remainder = EMPTY;

  let s = source.next();
  while (!s.done) {
    // #if _DEBUG
    console.log("consuming a chunk");
    // #endif

    const chunk = s.value;

    if (remainder.length !== 0 && chunk.length > 0) {
      return new Error(ENCODE_CHUNK_ALIGNMENT_ERROR);
    }

    if (chunk.length % 3) {
      const cut = chunk.length - (chunk.length % 3);
      base64 += writeQuads(chunk.subarray(0, cut));
      remainder = chunk.slice(cut);
    } else {
      base64 += writeQuads(chunk);
    }
    s = source.next();
  }

  if (s.done === true) {
    base64 += writeRemainder(remainder);
    return base64;
  } else {
    (s.done: Error);
    return s.done;
  }
}
