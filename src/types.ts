export type Memoization = Record<string, unknown>;

export interface StoreGetter {
	/**
	 * Returns the current memoization store.
	 */
	getStore(): Memoization | undefined;
}

export interface GenericMemoizerOptions {
	ignoreNotReadyStore?: boolean;
}
