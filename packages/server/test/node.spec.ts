import { createServerAdapter } from '@whatwg-node/server';
import { createServer, Server } from 'http';
import { fetch, Response } from '@whatwg-node/fetch';

describe('Node Specific Cases', () => {
  let port = 9876;
  let server: Server | undefined;
  afterEach(done => {
    if (server) {
      server.close(err => {
        if (err) {
          throw err;
        }
        server = undefined;
        done();
      });
    } else {
      done();
    }
    port = Math.floor(Math.random() * 1000) + 9800;
  });
  it('should handle empty responses', async () => {
    const serverAdapter = createServerAdapter(() => {
      return undefined as any;
    });
    server = createServer(serverAdapter);
    await new Promise<void>(resolve => server!.listen(port, resolve));
    const response = await fetch(`http://localhost:${port}`);
    await response.text();
    expect(response.status).toBe(404);
  });
  it('should handle waitUntil properly', async () => {
    let flag = false;
    const serverAdapter = createServerAdapter((_request, { waitUntil }) => {
      waitUntil(
        Promise.resolve().then(() => {
          flag = true;
        })
      );
      return Promise.resolve(
        new Response(null, {
          status: 204,
        })
      );
    });
    server = createServer(serverAdapter);
    await new Promise<void>(resolve => server!.listen(port, resolve));
    const response$ = fetch(`http://localhost:${port}`);
    expect(flag).toBe(false);
    const response = await response$;
    await response.text();
    expect(flag).toBe(true);
  });
});