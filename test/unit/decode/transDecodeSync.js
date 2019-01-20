/* @flow */

import test from "ava";
import Prando from "prando";
import { array } from "@capnp-js/trans-inject";
import { transEncodeSync as alignStrings } from "@capnp-js/trans-align-strings";

import transDecodeSync from "../../../lib/decode/transDecodeSync";

test("`transDecodeSync`", t => {
  const random = new Prando(238443);

  for (let i=0; i<5000; ++i) {
    const length = random.nextInt(0, 200);
    const expected = new Uint8Array(length);
    for (let i=0; i<length; ++i) {
      expected[i] = random.nextInt(0, 256);
    }

    let base64 = Buffer.from(expected).toString("base64");
    while (base64.charAt(base64.length - 1) === "=") {
      base64 = base64.substr(0, base64.length - 1);
    }

    const strings = [];
    let cut = 0;
    while (cut < base64.length) {
      const next = Math.min(cut + random.nextInt(0, 50), base64.length);
      strings.push(base64.slice(cut, next));
      cut = next;
    }

    const align = alignStrings(4);
    const decode = transDecodeSync(new Uint8Array(3 * random.nextInt(1, 17)));
    const decoding = decode(align(array(strings)));
    let position = 0;
    let j = decoding.next();
    while (!j.done) {
      t.deepEqual(j.value, expected.subarray(position, position + j.value.length));
      position += j.value.length;
      j = decoding.next();
    }

    t.is(position, expected.length);
    t.false(j.done instanceof Error);
  }
});
