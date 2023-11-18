import { NO_MEMOIZATION, getMemoizedValue, setMemoizedValue } from './utils';
import { GenericMemoizerOptions, MemoizationKey, StoreGetter } from './types';

const defaultOptions: Required<GenericMemoizerOptions> = {
	ignoreNotReadyStore: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => any;
type Methods<T extends object> = keyof {
	[K in keyof T as T[K] extends Func ? K : never]: T[K];
};

export class GenericMemoizer {
	private options: Required<GenericMemoizerOptions>;
	constructor(
		private storeGetter: StoreGetter,
		options?: GenericMemoizerOptions,
	) {
		this.options = {
			...defaultOptions,
			...options,
		};
	}

	/**
	 * Returns the callback result. If a previous
	 * memoized result is found, it is returned and the callback
	 * is not executed
	 * @param key The memoization key
	 * @param callback The callback to be executed if there is nothing memoized
	 * @returns The callback result (or a previous, memoized callback result)
	 */
	get<T>(key: MemoizationKey | MemoizationKey[], callback: () => T): T {
		const store = this.storeGetter.getStore();
		if (!store) {
			if (this.options.ignoreNotReadyStore) {
				return callback();
			}
			throw new Error('Memoizer store is not ready!');
		}
		const memoized = getMemoizedValue<T>(store, key);
		if (memoized !== NO_MEMOIZATION) return memoized;
		const realResult = callback();
		setMemoizedValue(store, key, realResult);
		return realResult;
	}

	wrap<TArgs extends unknown[], T>(
		callback: (...args: TArgs) => T,
		getKey: (...args: TArgs) => MemoizationKey | MemoizationKey[],
	) {
		return (...args: TArgs) => {
			const key = getKey(...args);
			return this.get(key, () => callback(...args));
		};
	}

	replace<TObj extends object, TMethod extends Methods<TObj>>(
		obj: TObj,
		methodName: TMethod,
		getKey: TObj[TMethod] extends Func
			? (
					...args: Parameters<TObj[TMethod]>
			  ) => MemoizationKey | MemoizationKey[]
			: never,
	) {
		const method = obj[methodName];
		if (typeof method !== 'function') {
			throw new TypeError(`${methodName.toString()} is not a function`);
		}

		obj[methodName] = this.wrap(
			method.bind(obj),
			getKey,
		) as (typeof obj)[typeof methodName];
	}
}
