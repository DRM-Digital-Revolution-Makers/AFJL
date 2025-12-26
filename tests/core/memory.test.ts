import { InMemoryStorage } from '../../src/core/memory';

describe('InMemoryStorage', () => {
  let memory: InMemoryStorage;

  beforeEach(() => {
    memory = new InMemoryStorage('session');
  });

  test('should add data', async () => {
    await memory.add({ key: 'value' });
    const data = await memory.query({});
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({ key: 'value' });
  });

  test('should persist data if localStorage is available (mocked)', async () => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        for (const key in store) delete store[key];
      })
    };
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

    const persistentMem = new InMemoryStorage('session');
    await persistentMem.add({ test: 'persist' });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });
});
