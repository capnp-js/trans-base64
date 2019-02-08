/* @flow */

import * as assert from "assert";
import Prando from "prando";
import { describe, it } from "mocha";
import { array } from "@capnp-js/trans-inject";
import { transEncodeSync as alignBytes } from "@capnp-js/trans-align-bytes";

import finishEncodeSync from "../../../src/encode/finishEncodeSync";

describe("finishEncodeSync", t => {
  const random = new Prando(7213);

  for (let i=0; i<5000; ++i) {
    it(`decodes random data i=${i}`, function () {
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
      const base64 = finishEncodeSync(align(array(buffers)));
      assert.ok(!(base64 instanceof Error));
      assert.equal(base64, expected);
    });
  }
});
