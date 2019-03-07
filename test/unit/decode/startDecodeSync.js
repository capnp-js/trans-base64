/* @flow */

import * as assert from "assert";
import Prando from "prando";
import { describe, it } from "mocha";
import { create, get, set } from "@capnp-js/bytes";

import startDecodeSync from "../../../src/decode/startDecodeSync";

describe("startDecodeSync", t => {
  const random = new Prando(348);

  for (let i=0; i<5000; ++i) {
    it(`decodes random data i=${i}`, function () {
      /* Choose byte sequence lengths randomly between 0 and 50. */
      const length = random.nextInt(0, 50);
      const expected = create(length);
      for (let i=0; i<length; ++i) {
        set(random.nextInt(0, 256), i, expected);
      }

      /* Choose buffer sizes randomly between 3 and 120. */
      const start = startDecodeSync(create(3 * random.nextInt(1, 40)));

      let base64 = Buffer.from(((expected: any): Uint8Array)).toString("base64");
      while (base64.charAt(base64.length - 1) === "=") {
        base64 = base64.substr(0, base64.length - 1);
      }

      let decoding = start(base64);
      let position = 0;
      for (let bytes=decoding.next(); !bytes.done; bytes=decoding.next()) {
        for (let j=0; j<bytes.value.length; ++j) {
          assert.equal(get(j, bytes.value), get(position++, expected));
        }
      }
      assert.equal(position, expected.length);
    });
  }
});
