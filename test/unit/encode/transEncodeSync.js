/* @flow */

import test from "ava";
import Prando from "prando";
import { array } from "@capnp-js/trans-inject";
import { transEncodeSync as alignBytes } from "@capnp-js/trans-align-bytes";

import transEncodeSync from "../../../lib/encode/transEncodeSync";

test("`transEncodeSync`", t => {
  const random = new Prando(922);

  for (let i=0; i<5000; ++i) {
    const length = random.nextInt(0, 200);
    const raw = new Uint8Array(length);
    for (let i=0; i<length; ++i) {
      raw[i] = random.nextInt(0, 256);
    }

    let expected = Buffer.from(raw).toString("base64");
    while (expected.charAt(expected.length - 1) === "=") {
      expected = expected.substr(0, expected.length - 1);
    }

    const buffers = [];
    let cut = 0;
    while (cut < length) {
      const next = Math.min(cut + random.nextInt(0, 50), length);
      buffers.push(raw.subarray(cut, next));
      cut = next;
    }

    const align = alignBytes(3);
    const encoding = transEncodeSync(align(array(buffers)));
    let base64 = "";
    let i = encoding.next();
    while (!i.done) {
      base64 += i.value;
      i = encoding.next();
    }

    t.false(i.done instanceof Error);

    t.is(base64, expected);
  }
});