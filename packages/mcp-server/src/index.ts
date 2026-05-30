#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { handleRequest, type JsonRpcRequest } from './protocol.js';

async function main(): Promise<void> {
  const rl = createInterface({ input: process.stdin, terminal: false });

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const request = JSON.parse(line) as JsonRpcRequest;
      const response = await handleRequest(request);
      if (response) {
        process.stdout.write(`${JSON.stringify(response)}\n`);
      }
    } catch (error) {
      process.stderr.write(
        `StitchGuard MCP error: ${error instanceof Error ? error.message : error}\n`,
      );
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
