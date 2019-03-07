/* @flow */

import type { BytesR } from "@capnp-js/bytes";

import { create } from "@capnp-js/bytes";

type uint = number;

export type StringCursor = {|
  string: string,
  i: uint,
|};

export const EMPTY: BytesR = create(0);
