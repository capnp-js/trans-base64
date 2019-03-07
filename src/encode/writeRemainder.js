/* @flow */

import type { BytesR } from "@capnp-js/bytes";

import { get } from "@capnp-js/bytes";

import { b2a } from "./constant";

export default function writeRemainder(bytes: BytesR): string {
  let base64 = "";

  let leftChar = 0;
  let leftBits = 0;

  for (let i=0; i<bytes.length; ++i) {
    leftChar = (leftChar << 8) | get(i, bytes);
    leftBits += 8;
    while (leftBits >= 6) {
      const idx = (leftChar >> (leftBits-6)) & 0x3f;
      base64 += b2a.charAt(idx);
      leftBits -=6;
    }
  }

  if (leftBits === 2) {
    base64 += b2a.charAt((leftChar & 0x03) << 4);
  } else if (leftBits === 4) {
    base64 += b2a.charAt((leftChar & 0x0f) << 2);
  }

  return base64;
}
