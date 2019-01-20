/* @flow */

type uint = number;

export type StringCursor = {|
  string: string,
  i: uint,
|};

export const EMPTY = new Uint8Array(0);
