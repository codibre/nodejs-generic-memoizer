import { Memoization, StoreGetter } from 'src/types';
import type Apm from 'elastic-apm-node';

const defaultMemoizationSymbol = Symbol('ApmStoreGetter');

/**
 * A StoreGetter implementation based on a APM transaction
 * @param symbol A symbol to isolate the memoizer context from others
 */
export class ApmStoreGetter implements StoreGetter {
	constructor(private storeSymbol: symbol = defaultMemoizationSymbol) {}

	getStore(): Memoization | undefined {
		const currentTransaction = (require('elastic-apm-node') as typeof Apm)
			.currentTransaction as unknown as Record<symbol, Memoization> | undefined;
		if (currentTransaction) {
			return (currentTransaction[this.storeSymbol] ??= {});
		}
	}
}
