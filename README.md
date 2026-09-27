# `@swaraj792725/mcp-client-kit`

> **Zero-dependency lightweight Model Context Protocol (MCP) client SDK and stdio process manager for Node.js and TypeScript.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Packages](https://img.shields.io/badge/registry-GitHub_Packages-green.svg)](https://github.com/swaraj792725?tab=packages)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

---

## 🌟 Overview

`@swaraj792725/mcp-client-kit` is an ultra-fast, zero-dependency Node.js client SDK for connecting to any Model Context Protocol (MCP) server over stdio.

### Key Features
- ⚡ **Zero External Dependencies**: Ultra-lightweight native JSON-RPC 2.0 stdio client protocol engine.
- 🔌 **Seamless Connection**: Automatically handles MCP initialization handshake (`initialize` / `notifications/initialized`).
- 🛠️ **Tool Inspection & Call Execution**: Simple `listTools()` and `callTool()` API methods.

---

## 📦 Installation

```bash
npm install @swaraj792725/mcp-client-kit --registry=https://npm.pkg.github.com
```

---

## 🚀 Quickstart

```typescript
import { createMCPClient } from '@swaraj792725/mcp-client-kit';

const client = createMCPClient();
await client.connect('npx', ['-y', '@swaraj792725/mcp-server-kit']);

const tools = await client.listTools();
console.log('Available MCP Tools:', tools);

const result = await client.callTool('echo', { message: 'Hello MCP!' });
console.log(result.content[0].text);

client.close();
```

---

## 📜 License

MIT © [Swaraj](https://github.com/swaraj792725)
