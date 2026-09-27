import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  function contextWithRole(role: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows administrators', () => {
    expect(guard.canActivate(contextWithRole('ADMIN'))).toBe(true);
  });

  it('rejects non-administrators', () => {
    expect(() => guard.canActivate(contextWithRole('REFEREE'))).toThrow(
      ForbiddenException,
    );
  });
});
