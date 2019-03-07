/* @flow */

import type { BytesR } from "@capnp-js/bytes";
import type {
  SugarlessIterator,
  SugarlessIteratorResult,
  IteratorTransform,
} from "@capnp-js/transform";

import TransformCore from "./TransformCore";

export default function transEncodeSync(source: SugarlessIterator<BytesR>): SugarlessIterator<string> {
  const status: {| done: null | (true | Error) |} = { done: null };

  const core = new TransformCore();

  return {
    next(): SugarlessIteratorResult<string> {
      if (status.done) {
        return { done: status.done };
      }

      const bytes = source.next();
      if (!bytes.done) {
        const base64 = core.set(bytes.value);
        if (base64 instanceof Error) {
          status.done = base64;
          return { done: base64 };
        } else {
          return {
            done: false,
            value: base64,
          };
        }
      } else {
        if (bytes.done === true) {
          status.done = true;
          return {
            done: false,
            value: core.finish(),
          };
        } else {
          (bytes.done: Error);
          status.done = bytes.done;
          return bytes;
        }
      }
    },
  };
}
(transEncodeSync: IteratorTransform<BytesR, string>);
