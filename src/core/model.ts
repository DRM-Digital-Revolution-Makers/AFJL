import { AIModel, AIModelOptions } from '../types';

export class LocalModel implements AIModel {
  id: string;
  private options: AIModelOptions;

  constructor(id: string, options: AIModelOptions = {}) {
    this.id = id;
    this.options = options;
  }

  async predict(input: unknown): Promise<unknown> {
    // In a real implementation, this would interface with WebGPU/WASM
    console.log(`[Model ${this.id}] predicting...`);
    return { output: "mock_prediction", confidence: 0.9 };
  }

  async train(data: unknown): Promise<void> {
      console.log(`[Model ${this.id}] training...`);
  }
}
