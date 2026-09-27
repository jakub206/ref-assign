import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports that the API is running', () => {
    expect(new AppController().getStatus()).toBe(
      'Ref Assign API is running...',
    );
  });
});
