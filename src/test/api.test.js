import { describe, it, expect, vi } from 'vitest';
import { api } from '../services/api';

describe('API service', () => {
  it('has expected endpoints', () => {
    expect(api.auth.login).toBeDefined();
    expect(api.monitors.create).toBeDefined();
    expect(api.checks.stats).toBeDefined();
    expect(api.users.list).toBeDefined();
  });

  it('has alerts endpoints', () => {
    expect(api.alerts.list).toBeDefined();
    expect(api.alerts.stats).toBeDefined();
    expect(api.alerts.markRead).toBeDefined();
    expect(api.alerts.markAllRead).toBeDefined();
    expect(api.alerts.close).toBeDefined();
  });

  it('has alertRules endpoints', () => {
    expect(api.alertRules.list).toBeDefined();
    expect(api.alertRules.create).toBeDefined();
    expect(api.alertRules.update).toBeDefined();
    expect(api.alertRules.delete).toBeDefined();
  });
});
