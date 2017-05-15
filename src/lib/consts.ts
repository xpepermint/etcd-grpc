import * as path from "path";

/**
 * First or last key.
 */
export const EDGE_KEY = "\0";

/**
 * No sorting (default).
 */
export const NONE_SORT_ORDER = 0;
/**
 * Lowest target value first.
 */
export const ASCEND_SORT_ORDER = 1;
/**
 * Highest target value first.
 */
export const DESCEND_SORT_ORDER = 2;

/**
 * Key name.
 */
export const KEY_SORT_TARGET = 0;
/**
 * Version number.
 */
export const VERSION_SORT_TARGET = 1;
/**
 * Created index.
 */
export const CREATE_SORT_TARGET = 2;
/**
 * Modified index.
 */
export const MOD_SORT_TARGET = 3;
/**
 * Key value.
 */
export const VALUE_SORT_TARGET = 4;

/**
 * Put KV event type.
 */
export const PUT_EVENT_TYPE = 0;
/**
 * Delete KV event type.
 */
export const DELETE_EVENT_TYPE = 1;
