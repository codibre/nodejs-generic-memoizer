import { GenericMemoizer, RecordStoreGetter } from 'src/index';

const proto = GenericMemoizer.prototype;

describe(GenericMemoizer.name, () => {
	describe(proto.get.name, () => {
		it('should memoize non promise value without generating a promise', () => {
			const callback: () => { a: string } = jest
				.fn()
				.mockImplementation(() => ({ a: 'b' }));
			const recordStoreGetter = new RecordStoreGetter();
			const target = new GenericMemoizer(recordStoreGetter);

			const result1 = target.get('my key', callback);
			const result2 = target.get('my key', callback);

			expect(result1).toEqual({ a: 'b' });
			expect(result1).toBe(result2);
		});

		it('should memoize a promise value returning the same promise both times', async () => {
			const callback: () => Promise<{ a: string }> = jest
				.fn()
				.mockImplementation(async () => ({ a: 'b' }));
			const recordStoreGetter = new RecordStoreGetter();
			const target = new GenericMemoizer(recordStoreGetter);

			const result1 = target.get('my key', callback);
			const result2 = target.get('my key', callback);

			expect(result1).toBe(result2);
			const awaitedResult = await result1;
			expect(awaitedResult).toBe(await result2);
		});

		it('should wrap function memoizing it', async () => {
			const callback: (k: string) => Promise<{ a: string }> = jest
				.fn()
				.mockImplementation(async () => ({ a: 'b' }));
			const recordStoreGetter = new RecordStoreGetter();
			const target = new GenericMemoizer(recordStoreGetter);

			const wrapped = target.wrap(callback, (a) => a);
			const result1 = wrapped('my key');
			const result2 = wrapped('my key');

			expect(result1).toBe(result2);
			const awaitedResult = await result1;
			expect(awaitedResult).toBe(await result2);
		});

		it('should replace method memoizing it', async () => {
			const obj = {
				method(_p: string) {
					return { a: 'b' };
				},
				prop: 1,
			};
			const recordStoreGetter = new RecordStoreGetter();
			const target = new GenericMemoizer(recordStoreGetter);

			target.replace(obj, 'method', (a) => a);
			const result1 = obj.method('my key');
			const result2 = obj.method('my key');

			expect(result1).toBe(result2);
			expect(result1).toEqual({ a: 'b' });
		});
	});
});
