import { NO_MEMOIZATION } from './utils';

export type MemoizationKey = string | number | symbol;
export interface MemoizationItem {
	memoized: unknown | typeof NO_MEMOIZATION;
	children?: Memoization;
}

export type Memoization = {
	[key in MemoizationKey]: MemoizationItem;
};

export interface StoreGetter {
	/**
	 * Returns the current memoization store.
	 */
	getStore(): Memoization | undefined;
}

export interface GenericMemoizerOptions {
	ignoreNotReadyStore?: boolean;
}
