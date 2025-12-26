import { CapabilityManager } from '../../src/core/security';

describe('CapabilityManager', () => {
  let manager: CapabilityManager;

  beforeEach(() => {
    manager = new CapabilityManager();
  });

  test('should create capabilities', () => {
    const cap = manager.createCapability('cam-access');
    expect(cap.id).toBe('cam-access');
    expect(cap.isValid()).toBe(true);
  });

  test('should create and resolve references', () => {
    const ref = manager.createRef<string>('api-key');
    ref.set('secret-123');
    expect(ref.get()).toBe('secret-123');
  });
});
