// Additional test helpers and utilities

// Delay helper for async tests
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry helper for flaky tests
export async function retry<T>(
  fn: () => Promise<T>,
  options = { retries: 3, delay: 100 }
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries - 1) {
        await delay(options.delay);
      }
    }
  }

  throw lastError;
}

// Wait for condition helper
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Condition not met within timeout');
    }
    await delay(interval);
  }
}

// Mock API response builder
export class MockAPIBuilder {
  private responses: Map<string, any> = new Map();
  private delays: Map<string, number> = new Map();

  mockEndpoint(endpoint: string, response: any, delayMs = 0) {
    this.responses.set(endpoint, response);
    if (delayMs > 0) {
      this.delays.set(endpoint, delayMs);
    }
    return this;
  }

  async fetch(endpoint: string) {
    const delayMs = this.delays.get(endpoint) || 0;
    if (delayMs > 0) {
      await delay(delayMs);
    }

    if (!this.responses.has(endpoint)) {
      throw new Error(`No mock response for endpoint: ${endpoint}`);
    }

    return this.responses.get(endpoint);
  }

  reset() {
    this.responses.clear();
    this.delays.clear();
  }
}

// Form testing helpers
export const fillForm = (form: HTMLFormElement, data: Record<string, string>) => {
  Object.entries(data).forEach(([name, value]) => {
    const input = form.elements.namedItem(name) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
};

export const submitForm = (form: HTMLFormElement) => {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};

// Date testing helpers
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  const originalDate = Date;

  // Override only `Date.now` to return the mocked time. Avoid overriding constructor to keep runtime behavior stable.
  global.Date = class extends originalDate {
    constructor(...args: any[]) {
      if (args.length > 0) {
        super(...args);
      } else {
        super(mockDate.getTime());
      }
    }
    static now() {
      return mockDate.getTime();
    }
  } as any;

  return () => {
    global.Date = originalDate;
  };
};

// Random data generators
export const randomString = (length = 10) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

export const randomNumber = (min = 0, max = 100) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomEmail = () => `${randomString()}@${randomString()}.com`;

export const randomBoolean = () => Math.random() > 0.5;

export const randomFromArray = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

// File upload testing helper
export const createMockFile = (name = 'test.txt', size = 1024, type = 'text/plain') => {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
};

// Network testing helpers
export const mockFetch = (response: any, options = { ok: true, status: 200 }) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: options.ok,
    status: options.status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

export const mockFetchError = (error = 'Network error') => {
  global.fetch = jest.fn().mockRejectedValue(new Error(error));
};

// Console mock helpers
export const suppressConsole = (methods: ('log' | 'warn' | 'error')[] = ['error']) => {
  const mocks: Record<string, jest.SpyInstance> = {};

  methods.forEach((method) => {
    mocks[method] = jest.spyOn(console, method).mockImplementation();
  });

  return {
    restore: () => {
      Object.values(mocks).forEach((mock) => mock.mockRestore());
    },
    getMocks: () => mocks,
  };
};

// Event helpers
export const createMouseEvent = (type: string, coords = { x: 0, y: 0 }) =>
  new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: coords.x,
    clientY: coords.y,
  });

export const createTouchEvent = (type: string, touches: Array<{ x: number; y: number }>) => {
  const touchList = touches.map((touch) => ({
    clientX: touch.x,
    clientY: touch.y,
    identifier: Math.random(),
    target: document.body,
  }));

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    changedTouches: touchList as any,
    targetTouches: touchList as any,
    touches: touchList as any,
  });
};

// Component state testing helper
export const getComponentState = (component: any) => {
  // For class components
  if (component.state) {
    return component.state;
  }

  // For functional components with hooks
  // This is a simplified version - actual implementation would need React internals
  return null;
};

// Snapshot serializer for removing dynamic values
export const createSnapshotSerializer = () => ({
  test: (val: any): val is object => val && typeof val === 'object',
  serialize: (val: any): string => {
    const cleaned = { ...val };

    // Remove dynamic fields
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.timestamp;

    return JSON.stringify(cleaned, null, 2);
  },
});

// Performance testing
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      throw new Error('Invalid marks');
    }

    return end - start;
  }

  clear() {
    this.marks.clear();
  }
}

// Memory leak detection helper
export const detectMemoryLeaks = (fn: () => void, threshold = 1000000) => {
  const before = (performance as any).memory?.usedJSHeapSize || 0;
  fn();
  const after = (performance as any).memory?.usedJSHeapSize || 0;
  const diff = after - before;

  return {
    leaked: diff > threshold,
    difference: diff,
    before,
    after,
  };
};

// Test data builder pattern
export class TestDataBuilder<T> {
  private data: Partial<T> = {};

  with(key: keyof T, value: T[keyof T]) {
    this.data[key] = value;
    return this;
  }

  build(defaults: T): T {
    return { ...defaults, ...this.data };
  }
}

// Batch testing helper
export const runTestsInBatch = async <T>(
  tests: Array<() => Promise<T>>,
  batchSize = 5
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < tests.length; i += batchSize) {
    const batch = tests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((test) => test()));
    results.push(...batchResults);
  }

  return results;
};

// Clipboard mock
export const mockClipboard = () => {
  let clipboardData = '';

  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn((text: string) => {
        clipboardData = text;
        return Promise.resolve();
      }),
      readText: jest.fn(() => Promise.resolve(clipboardData)),
    },
  });

  return {
    getData: () => clipboardData,
    clear: () => {
      clipboardData = '';
    },
  };
};

// Geolocation mock
export const mockGeolocation = (coords = { latitude: 40.7128, longitude: -74.006 }) => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords,
        timestamp: Date.now(),
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });

  return mockGeolocation;
};

// IndexedDB mock
export const mockIndexedDB = () => {
  const databases = new Map();

  const mockIDB = {
    open: jest.fn((name: string) => {
      if (!databases.has(name)) {
        databases.set(name, new Map());
      }

      return {
        onsuccess: null,
        result: {
          createObjectStore: jest.fn(),
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: jest.fn(),
              put: jest.fn(),
              delete: jest.fn(),
            })),
          })),
        },
      };
    }),
  };

  global.indexedDB = mockIDB as any;
  return { databases, mock: mockIDB };
};

// WebSocket mock
export class MockWebSocket {
  private listeners: Map<string, Function[]> = new Map();
  readyState = 1; // WebSocket.OPEN

  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(data: any) {
    // Mock send implementation
  }

  close() {
    this.readyState = 3; // WebSocket.CLOSED;
  }

  simulateMessage(data: any) {
    const listeners = this.listeners.get('message') || [];
    listeners.forEach((callback) => callback({ data }));
  }

  simulateError(error: Error) {
    const listeners = this.listeners.get('error') || [];
    listeners.forEach((callback) => callback({ error }));
  }
}
