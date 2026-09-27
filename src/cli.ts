#!/usr/bin/env node

import * as process from 'node:process';
import { createMCPClient } from './client.js';

function printHelp() {
  console.log(`
@swaraj792725/mcp-client-kit - Zero-dependency Model Context Protocol (MCP) client SDK

Usage:
  mcp-client-kit <command> [args...]

Example:
  npx @swaraj792725/mcp-client-kit npx @swaraj792725/mcp-server-kit
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const [cmd, ...cmdArgs] = args;
  const client = createMCPClient();

  try {
    console.error(`[INFO] Connecting to MCP Server: ${cmd} ${cmdArgs.join(' ')}`);
    await client.connect(cmd, cmdArgs);

    const tools = await client.listTools();
    console.log(`Available Tools (${tools.length}):`);
    console.log(JSON.stringify(tools, null, 2));

    client.close();
  } catch (err: any) {
    console.error('Error running MCP Client:', err.message || err);
    client.close();
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
