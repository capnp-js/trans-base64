/* @flow */

import type { BytesR, BytesB } from "@capnp-js/bytes";
import type {
  IteratorTransform,
  SugarlessIterator,
  SugarlessIteratorResult,
} from "@capnp-js/transform";

import { EMPTY } from "../common";

import TransformCore from "./TransformCore";

export default function transDecodeSync(buffer: BytesB): IteratorTransform<string, BytesR> {
  return function transform(source: SugarlessIterator<string>): SugarlessIterator<BytesR> {
    const status: {| done: null | (true | Error) |} = { done: null };

    const core = new TransformCore(buffer);

    return {
      next(): SugarlessIteratorResult<BytesR> {
        if (status.done) {
          return { done: status.done };
        }

        const bytes = core.next();
        if (!bytes.done) {
          return bytes;
        } else {
          const base64 = source.next();
          if (!base64.done) {
            core.set(base64.value);

            return {
              done: false,
              value: EMPTY,
            };
          } else {
            if (base64.done === true) {
              const flushed = core.flush();
              if (!flushed.done) {
                return flushed;
              } else {
                status.done = flushed.done;
                return flushed;
              }
            } else {
              (base64.done: Error);
              status.done = base64.done;
              return base64;
            }
          }
        }
      },
    };
  };
}
