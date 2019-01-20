/* @flow */

import test from "ava";

import startDecodeSync from "../../../lib/decode/startDecodeSync";

import Prando from "prando";

test("`startDecodeSync`", t => {
  const random = new Prando(348);

  for (let i=0; i<5000; ++i) {
    /* Choose byte sequence lengths randomly between 0 and 50. */
    const length = random.nextInt(0, 50);
    const expected = new Uint8Array(length);
    for (let i=0; i<length; ++i) {
      expected[i] = random.nextInt(0, 256);
    }

    /* Choose buffer sizes randomly between 3 and 120. */
    const start = startDecodeSync(new Uint8Array(3 * random.nextInt(1, 40)));

    let base64 = Buffer.from(expected).toString("base64");
    while (base64.charAt(base64.length - 1) === "=") {
      base64 = base64.substr(0, base64.length - 1);
    }

    let decoding = start(base64);
    let position = 0;
    for (let bytes=decoding.next(); !bytes.done; bytes=decoding.next()) {
      for (let j=0; j<bytes.value.length; ++j) {
        t.is(bytes.value[j], expected[position++]);
      }
    }
    t.is(position, expected.length);
  }
});
