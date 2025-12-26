import {
  AI,
  AIModel,
  AIMemory,
  AIAgent,
  AISemanticRef,
  AICapability,
  AIModelOptions,
  AIMemoryOptions,
  AIAgentConfig,
  AILearnOptions,
  AISelectConfig,
  Decision,
  AICapabilities,
  MemoryKind,
  AICapabilityOptions
} from './types';
import { LocalModel } from './core/model';
import { InMemoryStorage } from './core/memory';
import { Agent } from './core/agent';
import { securityManager } from './core/security';

class AIImpl implements AI {
  model(id: string, options?: AIModelOptions): AIModel {
    return new LocalModel(id, options);
  }

  memory(kind: MemoryKind, options?: AIMemoryOptions): AIMemory {
    return new InMemoryStorage(kind, options);
  }

  agent(config: AIAgentConfig): AIAgent {
    return new Agent(config);
  }

  observe(event: string, handler: (payload: unknown) => void): () => void {
    console.log(`[AI] Observing event: ${event}`);
    
    if (typeof window !== 'undefined') {
        const listener = (e: Event) => {
             // Extract relevant data from event
             const payload = {
                 type: e.type,
                 timeStamp: e.timeStamp,
                 target: (e.target as HTMLElement)?.tagName,
                 // Add more specific event data extraction if needed
             };
             handler(payload);
        };
        window.addEventListener(event, listener);
        return () => window.removeEventListener(event, listener);
    }

    return () => console.log(`[AI] Unsubscribed from ${event} (mock)`);
  }

  learn(data: unknown, options?: AILearnOptions): void {
    console.log('[AI] Global learning triggered', data, options);
  }

  async select<T extends Record<string, unknown>>(config: AISelectConfig<T>): Promise<Decision<T[keyof T]>> {
    // Basic heuristic simulation
    const keys = Object.keys(config.variants);
    
    if (keys.length === 0) {
       throw new Error("No variants provided for selection.");
    }

    // Simulate scoring based on goal relevance (placeholder logic)
    // In a real system, this would use a model to score P(variant | goal, context)
    let selectedKey = keys[0];
    let maxScore = -1;
    const scores: Record<string, number> = {};

    for (const key of keys) {
      // Random score + small boost if key words match goal words (simple heuristic)
      let score = Math.random();
      if (config.goal && typeof config.goal === 'string') {
         if (config.goal.toLowerCase().includes(key.toLowerCase())) {
             score += 0.5;
         }
      }
      scores[key] = score;
      
      if (score > maxScore) {
        maxScore = score;
        selectedKey = key;
      }
    }

    const result = config.variants[selectedKey] as T[keyof T];
    
    return {
      result,
      confidence: parseFloat(maxScore.toFixed(2)), // Normalized-ish
      reasoning: `Selected '${selectedKey}' with score ${maxScore.toFixed(2)}. Goal: "${config.goal || 'N/A'}"`,
      context_snapshot: config.context
    };
  }

  ref<T>(semanticID: string): AISemanticRef<T> {
    return securityManager.createRef<T>(semanticID);
  }

  capability(id: string, options?: AICapabilityOptions): AICapability {
    return securityManager.createCapability(id, options);
  }

  capabilities(): AICapabilities {
    // Basic detection logic
    const hasGPU = !!(typeof navigator !== 'undefined' && (navigator as any).gpu);
    const hasWasm = typeof WebAssembly !== 'undefined';
    
    return {
      gpu: hasGPU,
      wasm: hasWasm,
      memory: "indexeddb",
    };
  }
}

export const ai = new AIImpl();
export * from './types';
