import { Memoization, StoreGetter } from 'src/types';

/**
 * A StoreGetter provider that uses a simple plain object
 * Be careful when using this one, as the object memoizing things
 * is not automatically disposed. It's up to you to control its scope
 */
export class RecordStoreGetter implements StoreGetter {
	private memoization: Memoization = {};

	getStore(): Memoization {
		return this.memoization;
	}
}
