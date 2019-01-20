/* @flow */

import { b2a } from "./constant";

export default function writeQuads(bytes: Uint8Array): string {
  // #if _DEBUG
  console.log("writeQuads(bytes) beginning");
  // #endif

  let base64 = "";

  let leftChar = 0;
  let leftBits = 0;

  for (let i=0; i<bytes.length; ++i) {
    leftChar = (leftChar << 8) | bytes[i];
    leftBits += 8;
    while (leftBits >= 6) {
      const idx = (leftChar >> (leftBits-6)) & 0x3f;
      base64 += b2a.charAt(idx);
      leftBits -=6;
    }
  }

  // #if _DEBUG
  console.log("writeQuads(bytes) ending");
  // #endif

  return base64;
}
