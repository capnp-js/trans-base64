/* @flow */

import type {
  AsyncIteratorTransform,
  Source,
} from "@capnp-js/transform";

import { PULL_STREAM_BROKE_PROTOCOL } from "@capnp-js/transform";

import TransformCore from "./TransformCore";

export default function transEncode(source: Source<Uint8Array>): Source<string> {
  const status: {|
    doned: null | Error,
    done: null | (true | Error),
  |} = {
    doned: null,
    done: null,
  };

  const core = new TransformCore();

  return function encoded(abort: null | true, put: (null | (true | Error), string) => void): void {
    if (status.doned) {
      put(status.doned, "");
      return;
    }

    if (status.done) {
      put(status.done, "");
      return;
    }

    if (abort) {
      source(true, function (done, bytes) { // eslint-disable-line no-unused-vars
        if (!done) {
          throw new Error(PULL_STREAM_BROKE_PROTOCOL);
        } else {
          if (done === true) {
            put(true, "");
          } else {
            (done: Error);
            put(status.doned = done, "");
          }
        }
      });

      return;
    }

    source(null, function (done, bytes) {
      if (!done) {
        const base64 = core.set(bytes);
        if (base64 instanceof Error) {
          put(status.done = base64, "");
        } else {
          put(null, base64);
        }
      } else {
        if (done === true) {
          status.done = true;
          put(null, core.finish());
        } else {
          (done: Error);
          put(status.doned = done, "");
        }
      }
    });
  };
}
(transEncode: AsyncIteratorTransform<Uint8Array, string>);
