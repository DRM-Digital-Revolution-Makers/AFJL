import { AIMemory, AIMemoryOptions, MemoryKind } from '../types';

export class InMemoryStorage implements AIMemory {
  kind: MemoryKind;
  private store: unknown[] = [];
  private options: AIMemoryOptions;

  constructor(kind: MemoryKind, options: AIMemoryOptions = {}) {
    this.kind = kind;
    this.options = options;
    this.load();
  }

  private load() {
    // Simple persistence for browser environments
    if (typeof localStorage !== 'undefined' && this.kind !== 'vector') {
        const key = `afjl_memory_${this.kind}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                this.store = JSON.parse(saved);
            } catch (e) {
                console.error(`[Memory ${this.kind}] Failed to load persistence`, e);
            }
        }
    }
  }

  private save() {
    if (typeof localStorage !== 'undefined' && this.kind !== 'vector') {
        const key = `afjl_memory_${this.kind}`;
        try {
            localStorage.setItem(key, JSON.stringify(this.store));
        } catch (e) {
             console.error(`[Memory ${this.kind}] Failed to save persistence`, e);
        }
    }
  }

  async add(data: unknown): Promise<void> {
    this.store.push(data);
    this.save();
    console.log(`[Memory ${this.kind}] Added data. Total items: ${this.store.length}`);
  }

  async query(query: unknown): Promise<unknown[]> {
    // Mock query logic
    return this.store; 
  }
}
