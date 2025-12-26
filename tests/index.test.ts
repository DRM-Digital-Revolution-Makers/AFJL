import { ai } from '../src/index';

describe('AI Singleton', () => {
  test('should provide a model instance', () => {
    const model = ai.model('test-model');
    expect(model).toBeDefined();
    expect(model.id).toBe('test-model');
  });

  test('should provide a memory instance', () => {
    const memory = ai.memory('session');
    expect(memory).toBeDefined();
    expect(memory.kind).toBe('session');
  });

  test('should provide an agent instance', () => {
    const agent = ai.agent({ model: 'test-model' });
    expect(agent).toBeDefined();
  });

  test('should select best variant based on goal', async () => {
    const decision = await ai.select({
      variants: {
        'cheap': 'low cost option',
        'fast': 'high speed option'
      },
      goal: 'I need it fast'
    });
    
    // Given the heuristic, 'fast' should be selected because 'fast' matches the goal
    expect(decision.result).toBe('high speed option');
    expect(decision.confidence).toBeGreaterThan(0);
  });

  test('should return system capabilities', () => {
    const caps = ai.capabilities();
    expect(caps).toHaveProperty('gpu');
    expect(caps).toHaveProperty('wasm');
    expect(caps).toHaveProperty('memory');
  });
});
