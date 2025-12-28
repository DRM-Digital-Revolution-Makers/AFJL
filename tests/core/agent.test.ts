import { Agent } from '../../src/core/agent';
import { LocalModel } from '../../src/core/model';

describe('Agent', () => {
  let agent: Agent;
  let model: LocalModel;

  beforeEach(() => {
    model = new LocalModel('test-model');
    agent = new Agent({ model });
  });

  test('should initialize with an ID', () => {
    expect(agent.id).toBeDefined();
    expect(agent.id).toMatch(/^agent-/);
  });

  test('should act using the model', async () => {
    const result = await agent.act({ input: 'test' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('confidence');
  });

  test('should work in implicit mode without model', async () => {
    const autoAgent = new Agent({});
    const result: any = await autoAgent.act({ input: 'test' });
    expect(result.output).toContain('Auto-Pilot');
    expect(result.reasoning).toContain('Implicit');
  });

  test('should learn', async () => {
    await expect(agent.learn({ data: 'training-data' })).resolves.not.toThrow();
  });
});
