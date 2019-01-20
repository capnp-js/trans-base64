/* @flow */

import type {
  AsyncIteratorTransform,
  Source,
} from "@capnp-js/transform";

import { PULL_STREAM_BROKE_PROTOCOL } from "@capnp-js/transform";

import TransformCore from "./TransformCore";

import { EMPTY } from "../common";

export default function transDecode(buffer: Uint8Array): AsyncIteratorTransform<string, Uint8Array> {
  return function transform(source: Source<string>): Source<Uint8Array> {
    const status: {|
      doned: null | Error,
      done: null | (true | Error),
    |} = {
      doned: null,
      done: null,
    };

    const core = new TransformCore(buffer);

    return function decoded(abort: null | true, put: (null | (true | Error), Uint8Array) => void): void {
      if (status.doned) {
        put(status.doned, EMPTY);
        return;
      }

      if (status.done) {
        put(status.done, EMPTY);
        return;
      }

      if (abort) {
        source(true, function (done, base64) { // eslint-disable-line no-unused-vars
          if (!done) {
            throw new Error(PULL_STREAM_BROKE_PROTOCOL);
          } else {
            if (done === true) {
              put(true, EMPTY);
            } else {
              (done: Error);
              put(status.doned = done, EMPTY);
            }
          }
        });

        return;
      }

      const bytes = core.next();
      if (!bytes.done) {
        put(null, bytes.value);
      } else {
        source(null, function (done, base64) {
          if (!done) {
            core.set(base64);

            put(null, EMPTY);
          } else {
            if (done === true) {
              const flushed = core.flush();
              if (!flushed.done) {
                put(null, flushed.value);
              } else {
                put(status.done = flushed.done, EMPTY);
              }
            } else {
              (done: Error);
              put(status.doned = done, EMPTY);
            }
          }
        });
      }
    };
  };
}
