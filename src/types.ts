export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue | undefined;
}

export interface RequestOptions {
  readTimeout?: number;
  writeTimeout?: number;
  connectTimeout?: number;
  poolTimeout?: number;
}
