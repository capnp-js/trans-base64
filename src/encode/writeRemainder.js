/* @flow */

import { b2a } from "./constant";

export default function writeRemainder(bytes: Uint8Array): string {
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

  if (leftBits === 2) {
    base64 += b2a.charAt((leftChar & 0x03) << 4);
  } else if (leftBits === 4) {
    base64 += b2a.charAt((leftChar & 0x0f) << 2);
  }

  return base64;
}
