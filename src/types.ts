export interface MCPClientOptions {
  clientName?: string;
  clientVersion?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPCallToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}
