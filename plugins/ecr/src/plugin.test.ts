import { ecrPlugin } from './plugin';

describe('ecr', () => {
  it('should export plugin', () => {
    expect(ecrPlugin).toBeDefined();
  });
});
