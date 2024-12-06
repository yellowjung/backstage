import { randomJokePlugin } from './plugin';

describe('random-joke', () => {
  it('should export plugin', () => {
    expect(randomJokePlugin).toBeDefined();
  });
});
