import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AlertBadge from '../components/ui/AlertBadge';
import Alerts from '../pages/Alerts';

const mockAlertsApi = {
  list: vi.fn(() => Promise.resolve([])),
  stats: vi.fn(() => Promise.resolve({ open: 0, read: 0, closed: 0, total: 0 })),
  markRead: vi.fn(() => Promise.resolve()),
  markAllRead: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
};

vi.mock('../services/api', () => ({
  api: {
    alerts: {
      list: vi.fn(() => Promise.resolve([])),
      stats: vi.fn(() => Promise.resolve({ open: 0, read: 0, closed: 0, total: 0 })),
      markRead: vi.fn(() => Promise.resolve()),
      markAllRead: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    },
  },
}));

describe('AlertBadge', () => {
  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <AlertBadge />
      </BrowserRouter>
    );
  });
});

describe('Alerts page', () => {
  it('renders page title', async () => {
    render(
      <BrowserRouter>
        <Alerts />
      </BrowserRouter>
    );
    expect(await screen.findByText('Alertas')).toBeDefined();
  });
});
