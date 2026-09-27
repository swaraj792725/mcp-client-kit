import { describe, it, expect, afterEach } from 'vitest';
import { createMCPClient, MCPClient } from '../src/index.js';

describe('mcp-client-kit', () => {
  let client: MCPClient | null = null;

  afterEach(() => {
    if (client) {
      client.close();
      client = null;
    }
  });

  it('connects to an MCP server, lists tools, and executes a tool call', async () => {
    client = createMCPClient({ clientName: 'test-client' });

    // Inline mock server script
    const mockServerScript = `
      process.stdin.on('data', chunk => {
        const lines = chunk.toString().split('\\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const req = JSON.parse(line);
          if (req.method === 'initialize') {
            process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { protocolVersion: '2024-11-05', serverInfo: { name: 'mock', version: '1.0.0' } } }) + '\\n');
          } else if (req.method === 'tools/list') {
            process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { tools: [{ name: 'multiply', description: 'Multiplies two numbers', inputSchema: {} }] } }) + '\\n');
          } else if (req.method === 'tools/call') {
            const { a, b } = req.params.arguments;
            process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: String(a * b) }] } }) + '\\n');
          }
        }
      });
    `;

    await client.connect('node', ['-e', mockServerScript]);

    const tools = await client.listTools();
    expect(tools.length).toBe(1);
    expect(tools[0].name).toBe('multiply');

    const result = await client.callTool('multiply', { a: 6, b: 7 });
    expect(result.content[0].text).toBe('42');
  });
});
