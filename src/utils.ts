import { Memoization, MemoizationItem, MemoizationKey } from './types';

export const NO_MEMOIZATION = Symbol('NO_MEMOIZATION');

export function getMemoizedValue<T>(
	store: Memoization,
	key: MemoizationKey | MemoizationKey[],
): T | typeof NO_MEMOIZATION {
	if (!Array.isArray(key)) {
		key = [key];
	}
	let result: MemoizationItem = { children: store, memoized: NO_MEMOIZATION };
	for (const item of key) {
		if (!result.children) return NO_MEMOIZATION;
		const next = result.children[item];
		if (!next) return NO_MEMOIZATION;
		result = next;
	}
	return result.memoized as T;
}

export function setMemoizedValue<T>(
	store: Memoization,
	key: MemoizationKey | MemoizationKey[],
	value: T,
) {
	if (!Array.isArray(key)) {
		key = [key];
	}
	let current = store;
	let lastItem: MemoizationItem | undefined;
	for (const item of key) {
		lastItem = current[item] ??= {
			memoized: NO_MEMOIZATION,
		};
		current = lastItem.children ??= {};
	}
	if (lastItem) {
		lastItem.memoized = value;
	}
}
