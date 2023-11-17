import { AsyncLocalStoreGetter, GenericMemoizer } from 'src/index';

const proto = GenericMemoizer.prototype;

describe(GenericMemoizer.name, () => {
	const storage = new AsyncLocalStoreGetter();

	describe(proto.get.name, () => {
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
			const target = new GenericMemoizer(storage, {
				ignoreNotReadyStore: true,
			});
			let result1: any;
			let result2: any;

			storage.run(() => {
				result1 = target.get('my key', callback);
				result2 = target.get('my key', callback);
			});
			const result3 = target.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).toBe(result2);
			expect(result1).not.toBe(result3);
		});

		it('should memoize result when store is ready through startContext', async () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const target = new GenericMemoizer(storage, {
				ignoreNotReadyStore: true,
			});
			let result1: any;
			let result2: any;

			await new Promise<void>((resolve) =>
				setImmediate(() => {
					storage.startContext();
					result1 = target.get('my key', callback);
					result2 = target.get('my key', callback);
					resolve();
				}),
			);
			const result3 = target.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).toBe(result2);
			expect(result1).not.toBe(result3);
		});
	});
});
