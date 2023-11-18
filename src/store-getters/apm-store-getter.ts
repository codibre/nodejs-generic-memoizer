import { Memoization, StoreGetter } from 'src/types';
import type Apm from 'elastic-apm-node';

const defaultMemoizationSymbol = Symbol('ApmStoreGetter');

function defaultGetTransaction() {
	return (require('elastic-apm-node') as typeof Apm).currentTransaction;
}

/**
 * A StoreGetter implementation based on a APM transaction
 * @param symbol A symbol to isolate the memoizer context from others
 */
export class ApmStoreGetter implements StoreGetter {
	constructor(
		private storeSymbol: symbol = defaultMemoizationSymbol,
		private getTransaction: () => unknown = defaultGetTransaction,
	) {}

	getStore(): Memoization | undefined {
		const currentTransaction = this.getTransaction() as
			| Record<symbol, Memoization>
			| undefined;
		if (currentTransaction) {
			return (currentTransaction[this.storeSymbol] ??= {});
		}
	}
}
