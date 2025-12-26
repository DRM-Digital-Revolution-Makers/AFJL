import { AIAgent, AIAgentConfig, AIModel, AIMemory } from '../types';

export class Agent implements AIAgent {
  id: string;
  private model: AIModel | string;
  private memory?: AIMemory | string;
  private tools: unknown[];

  constructor(config: AIAgentConfig) {
    this.id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.model = config.model;
    this.memory = config.memory;
    this.tools = config.tools || [];
  }

  async learn(data: unknown): Promise<void> {
    console.log(`[Agent ${this.id}] Learning...`);
    if (this.memory && typeof this.memory !== 'string') {
      await this.memory.add(data);
    }
    
    if (typeof this.model !== 'string' && this.model.train) {
        await this.model.train(data);
    }
  }

  async act(context: unknown): Promise<unknown> {
    console.log(`[Agent ${this.id}] Acting on context...`);
    if (typeof this.model !== 'string') {
        return this.model.predict(context);
    }
    return { error: "Model not resolved" };
  }
}
