import { AsyncLocalStorage } from 'async_hooks';
import { Memoization, StoreGetter } from 'src/types';

/**
 * StoreGetter implementation using AsyncLocalStorage
 */
export class AsyncLocalStoreGetter implements StoreGetter {
	private storage = new AsyncLocalStorage<Memoization>();

	getStore(): Memoization | undefined {
		return this.storage.getStore();
	}

	/**
	 * Runs the callback within a context
	 * with an exclusive memoization store
	 * @param callback The callback to be executed
	 * @returns The callback result
	 */
	run<T>(callback: () => T) {
		return this.storage.run({}, callback);
	}

	/**
	 * Starts a store inside the current async context
	 */
	startContext() {
		this.storage.enterWith({});
	}
}
