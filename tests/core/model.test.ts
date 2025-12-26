import { LocalModel } from '../../src/core/model';

describe('LocalModel', () => {
  let model: LocalModel;

  beforeEach(() => {
    model = new LocalModel('gpt-mini');
  });

  test('should return a prediction', async () => {
    const prediction = await model.predict('hello');
    expect(prediction).toEqual({ output: "mock_prediction", confidence: 0.9 });
  });

  test('should accept training data', async () => {
    await expect(model.train('data')).resolves.not.toThrow();
  });
});
