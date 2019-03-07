/* @flow */

import * as assert from "assert";
import Prando from "prando";
import { describe, it } from "mocha";
import { create, getSubarray, set } from "@capnp-js/bytes";
import { array } from "@capnp-js/trans-inject";
import { transEncodeSync as alignBytes } from "@capnp-js/trans-align-bytes";

import transEncodeSync from "../../../src/encode/transEncodeSync";

describe("transEncodeSync", t => {
  const random = new Prando(922);

  for (let i=0; i<5000; ++i) {
    it(`decodes random data i=${i}`, function () {
      const length = random.nextInt(0, 200);
      const raw = create(length);
      for (let i=0; i<length; ++i) {
        set(random.nextInt(0, 256), i, raw);
      }

      let expected = Buffer.from(((raw: any): Uint8Array)).toString("base64");
      while (expected.charAt(expected.length - 1) === "=") {
        expected = expected.substr(0, expected.length - 1);
      }

      const buffers = [];
      let cut = 0;
      while (cut < length) {
        const next = Math.min(cut + random.nextInt(0, 50), length);
        buffers.push(getSubarray(cut, next, raw));
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

      assert.ok(!(i.done instanceof Error));

      assert.equal(base64, expected);
    });
  }
});
