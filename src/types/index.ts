export type MemoryKind = "vector" | "episodic" | "session" | "long-term";

export interface Decision<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  context_snapshot?: Record<string, unknown>;
}

export interface AIModelOptions {
  runtime?: "webgpu" | "wasm" | "cloud";
  quantization?: "4bit" | "8bit" | "none";
  [key: string]: unknown;
}

export interface AIModel {
  id: string;
  predict(input: unknown): Promise<unknown>;
  train?(data: unknown): Promise<void>;
}

export interface AIMemoryOptions {
  backend?: "indexeddb" | "memory" | "remote";
  size?: string;
  [key: string]: unknown;
}

export interface AIMemory {
  kind: MemoryKind;
  add(data: unknown): Promise<void>;
  query(query: unknown): Promise<unknown[]>;
}

export interface AIAgentConfig {
  model?: AIModel | string;
  memory?: AIMemory | string;
  tools?: unknown[];
}

export interface AIAgent {
  id: string;
  learn(data: unknown): Promise<void>;
  act(context: unknown): Promise<unknown>;
}

export interface AICapabilityOptions {
  ttl?: string; // e.g. "5m"
  scope?: "session" | "global" | "tab";
}

export interface AICapability {
  id: string;
  isValid(): boolean;
}

export interface AISemanticRef<T> {
  get(): T | undefined;
  set(value: T): void;
}

export interface AILearnOptions {
  type?: "reinforcement" | "supervised";
  feedback?: unknown;
}

export interface AISelectConfig<T extends Record<string, unknown>> {
  variants: T;
  context?: Record<string, unknown>;
  goal?: string;
}

export interface AICapabilities {
  gpu: boolean;
  wasm: boolean;
  memory: string;
}

export interface AI {
  model(id: string, options?: AIModelOptions): AIModel;
  memory(kind: MemoryKind, options?: AIMemoryOptions): AIMemory;
  agent(config: AIAgentConfig): AIAgent;
  observe(event: string, handler: (payload: unknown) => void): () => void;
  learn(data: unknown, options?: AILearnOptions): void;
  select<T extends Record<string, unknown>>(config: AISelectConfig<T>): Promise<Decision<T[keyof T]>>;
  ref<T>(semanticID: string): AISemanticRef<T>;
  capability(id: string, options?: AICapabilityOptions): AICapability;
  capabilities(): AICapabilities;
}
