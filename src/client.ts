import { spawn, ChildProcess } from 'node:child_process';
import { MCPClientOptions, MCPToolInfo, MCPCallToolResult } from './types.js';

export class MCPClient {
  public readonly clientName: string;
  public readonly clientVersion: string;
  private process: ChildProcess | null = null;
  private nextId = 1;
  private pendingRequests = new Map<number | string, { resolve: (res: any) => void; reject: (err: any) => void }>();
  private buffer = '';

  constructor(options: MCPClientOptions = {}) {
    this.clientName = options.clientName || 'mcp-client-kit';
    this.clientVersion = options.clientVersion || '1.0.0';
  }

  /**
   * Spawns an MCP server child process and completes initial protocol handshake.
   */
  public async connect(command: string, args: string[] = [], env: Record<string, string> = {}): Promise<this> {
    this.process = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.process.stdout?.on('data', chunk => {
      this.buffer += chunk.toString('utf8');
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
            const { resolve, reject } = this.pendingRequests.get(msg.id)!;
            this.pendingRequests.delete(msg.id);

            if (msg.error) {
              reject(new Error(`MCP Error ${msg.error.code}: ${msg.error.message}`));
            } else {
              resolve(msg.result);
            }
          }
        } catch {
          // Ignore invalid JSON lines
        }
      }
    });

    // 1. Send initialize
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: this.clientName,
        version: this.clientVersion
      }
    });

    // 2. Send initialized notification
    this.notify('notifications/initialized', {});

    return this;
  }

  /**
   * Lists all available tools exposed by the connected MCP server.
   */
  public async listTools(): Promise<MCPToolInfo[]> {
    const res = await this.request('tools/list', {});
    return res.tools || [];
  }

  /**
   * Invokes a specific tool on the connected MCP server with input arguments.
   */
  public async callTool(name: string, args: Record<string, any> = {}): Promise<MCPCallToolResult> {
    const res = await this.request('tools/call', {
      name,
      arguments: args
    });
    return res;
  }

  /**
   * Closes the connected MCP server child process safely.
   */
  public close(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  public request(method: string, params: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        return reject(new Error('MCPClient process is not connected. Call connect() first.'));
      }

      const id = this.nextId++;
      this.pendingRequests.set(id, { resolve, reject });

      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params
      }) + '\n';

      this.process.stdin.write(payload);
    });
  }

  private notify(method: string, params: Record<string, any>): void {
    if (!this.process || !this.process.stdin) return;
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params
    }) + '\n';
    this.process.stdin.write(payload);
  }
}

export function createMCPClient(options?: MCPClientOptions): MCPClient {
  return new MCPClient(options);
}
