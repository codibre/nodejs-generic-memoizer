let currentTransaction: any;
jest.mock('elastic-apm-node', () => ({
	get currentTransaction() {
		return currentTransaction;
	},
}));
import { ApmStoreGetter, GenericMemoizer } from 'src/index';

const proto = GenericMemoizer.prototype;

describe(GenericMemoizer.name, () => {
	const storage = new ApmStoreGetter();

	describe(proto.get.name, () => {
		beforeEach(() => {
			currentTransaction = undefined;
		});
		it('should throw an error when memoization is not ready', () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const target = new GenericMemoizer(storage);
			let thrownError: any;

			try {
				target.get('my key', callback);
			} catch (err) {
				thrownError = err;
			}

			expect(thrownError).toBeInstanceOf(Error);
		});

		it('should not memoize result when store is not ready but GenericMemoizer is set to ignore it', () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const target = new GenericMemoizer(storage, {
				ignoreNotReadyStore: true,
			});

			const result1 = target.get('my key', callback);
			const result2 = target.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).not.toBe(result2);
		});

		it('should memoize result when store is ready through run', () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const target = new GenericMemoizer(storage);
			currentTransaction = {};

			const result1 = target.get('my key', callback);
			const result2 = target.get('my key', callback);
			currentTransaction = {};
			const result3 = target.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).toBe(result2);
			expect(result1).not.toBe(result3);
		});

		it('should not mix different memoizing contexts', () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const target1 = new GenericMemoizer(storage);
			const target2 = new GenericMemoizer(
				new ApmStoreGetter(Symbol('UniqueContext')),
			);
			currentTransaction = {};

			const result1 = target1.get('my key', callback);
			const result2 = target2.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).not.toBe(result2);
		});
	});
});
