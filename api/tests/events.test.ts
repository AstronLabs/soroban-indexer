import { describe, expect, it, vi } from 'vitest';
import { startSSEHeartbeat } from '../src/routes/events.js';

describe('SSE heartbeat', () => {
  it('sends a :ping frame every 15 seconds', () => {
    vi.useFakeTimers();

    const write = vi.fn();

    const request = {
      raw: {
        on: vi.fn(),
      },
    };

    const reply = {
      raw: {
        write,
      },
    };

    const heartbeat = startSSEHeartbeat(request, reply);

    // Initial connection event
    expect(write).toHaveBeenCalledWith(
      'data: {"message": "connected"}\n\n'
    );

    // No heartbeat before 15 seconds
    expect(write).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(15_000);

    expect(write).toHaveBeenCalledWith(':ping\n\n');

    vi.advanceTimersByTime(15_000);

    expect(write).toHaveBeenCalledTimes(3);

    clearInterval(heartbeat);
    vi.useRealTimers();
  });

  it('clears the heartbeat when the client disconnects', () => {
    vi.useFakeTimers();

    const write = vi.fn();
    let closeHandler: (() => void) | undefined;

    const request = {
      raw: {
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'close') {
            closeHandler = handler;
          }
        }),
      },
    };

    const reply = {
      raw: {
        write,
      },
    };

    startSSEHeartbeat(request, reply);

    vi.advanceTimersByTime(15_000);

    expect(write).toHaveBeenCalledWith(':ping\n\n');

    const callsBeforeClose = write.mock.calls.length;

    closeHandler?.();

    vi.advanceTimersByTime(30_000);

    expect(write.mock.calls.length).toBe(callsBeforeClose);

    vi.useRealTimers();
  });
});