// To regenerate bookmark_pb.ts from this file,
// use `buf` and protoc-gen-es, and run `buf generate` in this directory.

// @generated by protoc-gen-es v0.4.0 with parameter "target=ts"
// @generated from file bookmark.proto (package bookmark, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum bookmark.TristateBoolean
 */
export enum TristateBoolean {
  /**
   * @generated from enum value: UNSET = 0;
   */
  UNSET = 0,

  /**
   * @generated from enum value: FALSE = 1;
   */
  FALSE = 1,

  /**
   * @generated from enum value: TRUE = 2;
   */
  TRUE = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(TristateBoolean)
proto3.util.setEnumType(TristateBoolean, "bookmark.TristateBoolean", [
  { no: 0, name: "UNSET" },
  { no: 1, name: "FALSE" },
  { no: 2, name: "TRUE" },
]);

/**
 * Represents differences in layer visibility from the default configuration.
 *
 * @generated from message bookmark.LayerVisibilityBookmarkFragment
 */
export class LayerVisibilityBookmarkFragment extends Message<LayerVisibilityBookmarkFragment> {
  /**
   * @generated from field: repeated bookmark.LayerInformation layers = 1;
   */
  layers: LayerInformation[] = [];

  constructor(data?: PartialMessage<LayerVisibilityBookmarkFragment>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "bookmark.LayerVisibilityBookmarkFragment";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "layers", kind: "message", T: LayerInformation, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LayerVisibilityBookmarkFragment {
    return new LayerVisibilityBookmarkFragment().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LayerVisibilityBookmarkFragment {
    return new LayerVisibilityBookmarkFragment().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LayerVisibilityBookmarkFragment {
    return new LayerVisibilityBookmarkFragment().fromJsonString(jsonString, options);
  }

  static equals(a: LayerVisibilityBookmarkFragment | PlainMessage<LayerVisibilityBookmarkFragment> | undefined, b: LayerVisibilityBookmarkFragment | PlainMessage<LayerVisibilityBookmarkFragment> | undefined): boolean {
    return proto3.util.equals(LayerVisibilityBookmarkFragment, a, b);
  }
}

/**
 * @generated from message bookmark.LayerInformation
 */
export class LayerInformation extends Message<LayerInformation> {
  /**
   * The ID of this layer, relative to the previous layer plus one.
   *
   * (e.g. if the previous layer was 3, and this layer is 5, the relative_id will be 1)
   *
   * @generated from field: int32 relative_id = 1;
   */
  relativeId = 0;

  /**
   * the new visibility state of the layer.
   *
   * note: this is a tristate value, as all values in protobuf are optional,
   * and will default to `false` otherwise.
   *
   * @generated from field: bookmark.TristateBoolean visible = 2;
   */
  visible = TristateBoolean.UNSET;

  /**
   * The opacity of the layer, in percent (0-100, represented as 1-101).
   * If this value is 0, the layer-default opacity is used. A value of 1 maps to 0%,
   * etc.
   *
   * @generated from field: uint32 opacity = 3;
   */
  opacity = 0;

  constructor(data?: PartialMessage<LayerInformation>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "bookmark.LayerInformation";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "relative_id", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 2, name: "visible", kind: "enum", T: proto3.getEnumType(TristateBoolean) },
    { no: 3, name: "opacity", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LayerInformation {
    return new LayerInformation().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LayerInformation {
    return new LayerInformation().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LayerInformation {
    return new LayerInformation().fromJsonString(jsonString, options);
  }

  static equals(a: LayerInformation | PlainMessage<LayerInformation> | undefined, b: LayerInformation | PlainMessage<LayerInformation> | undefined): boolean {
    return proto3.util.equals(LayerInformation, a, b);
  }
}

/**
 * @generated from message bookmark.LayerTreeOrderBookmarkFragment
 */
export class LayerTreeOrderBookmarkFragment extends Message<LayerTreeOrderBookmarkFragment> {
  /**
   * @generated from field: map<string, bookmark.LayerTreeOrderInformation> ordering = 1;
   */
  ordering: { [key: string]: LayerTreeOrderInformation } = {};

  constructor(data?: PartialMessage<LayerTreeOrderBookmarkFragment>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "bookmark.LayerTreeOrderBookmarkFragment";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ordering", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: LayerTreeOrderInformation} },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LayerTreeOrderBookmarkFragment {
    return new LayerTreeOrderBookmarkFragment().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LayerTreeOrderBookmarkFragment {
    return new LayerTreeOrderBookmarkFragment().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LayerTreeOrderBookmarkFragment {
    return new LayerTreeOrderBookmarkFragment().fromJsonString(jsonString, options);
  }

  static equals(a: LayerTreeOrderBookmarkFragment | PlainMessage<LayerTreeOrderBookmarkFragment> | undefined, b: LayerTreeOrderBookmarkFragment | PlainMessage<LayerTreeOrderBookmarkFragment> | undefined): boolean {
    return proto3.util.equals(LayerTreeOrderBookmarkFragment, a, b);
  }
}

/**
 * @generated from message bookmark.LayerTreeOrderInformation
 */
export class LayerTreeOrderInformation extends Message<LayerTreeOrderInformation> {
  /**
   * @generated from field: repeated string children = 1;
   */
  children: string[] = [];

  constructor(data?: PartialMessage<LayerTreeOrderInformation>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime = proto3;
  static readonly typeName = "bookmark.LayerTreeOrderInformation";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "children", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LayerTreeOrderInformation {
    return new LayerTreeOrderInformation().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LayerTreeOrderInformation {
    return new LayerTreeOrderInformation().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LayerTreeOrderInformation {
    return new LayerTreeOrderInformation().fromJsonString(jsonString, options);
  }

  static equals(a: LayerTreeOrderInformation | PlainMessage<LayerTreeOrderInformation> | undefined, b: LayerTreeOrderInformation | PlainMessage<LayerTreeOrderInformation> | undefined): boolean {
    return proto3.util.equals(LayerTreeOrderInformation, a, b);
  }
}

