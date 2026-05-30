export type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
};

const TOOLS = [
  {
    name: 'stitchguard_capture_url',
    description: 'Capture a URL screenshot with Playwright for visual comparison',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        outputPath: { type: 'string' },
        viewport: { type: 'string' },
        waitMs: { type: 'number' },
      },
      required: ['url', 'outputPath'],
    },
  },
  {
    name: 'stitchguard_compare_images',
    description: 'Compare target and actual screenshots; write diff, heatmap, report, and prompt',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: { type: 'string' },
        actualPath: { type: 'string' },
        outputDir: { type: 'string' },
        threshold: { type: 'number' },
      },
      required: ['targetPath', 'actualPath'],
    },
  },
  {
    name: 'stitchguard_generate_report',
    description: 'Generate markdown report from an existing result.json',
    inputSchema: {
      type: 'object',
      properties: { resultPath: { type: 'string' } },
      required: ['resultPath'],
    },
  },
  {
    name: 'stitchguard_generate_codex_prompt',
    description: 'Generate a Codex/Cursor/Claude repair prompt from result.json',
    inputSchema: {
      type: 'object',
      properties: {
        resultPath: { type: 'string' },
        agent: { type: 'string', enum: ['codex', 'cursor', 'claude'] },
      },
      required: ['resultPath'],
    },
  },
  {
    name: 'stitchguard_list_artifacts',
    description: 'List files in a StitchGuard output directory',
    inputSchema: {
      type: 'object',
      properties: { outputDir: { type: 'string' } },
    },
  },
];

export async function handleRequest(
  request: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  const id = request.id ?? null;
  if (request.id === undefined) {
    // notification — no response
    if (request.method === 'notifications/initialized') return null;
  }

  try {
    let result: unknown;

    switch (request.method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'stitchguard', version: '0.1.0' },
        };
        break;
      case 'tools/list':
        result = { tools: TOOLS };
        break;
      case 'tools/call': {
        const params = request.params as { name: string; arguments?: Record<string, unknown> };
        const text = await invokeTool(params.name, params.arguments ?? {});
        result = { content: [{ type: 'text', text }] };
        break;
      }
      case 'ping':
        result = {};
        break;
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${request.method}` },
        };
    }

    if (request.id === undefined) return null;

    return { jsonrpc: '2.0', id, result };
  } catch (error) {
    if (request.id === undefined) return null;
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function invokeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const { runTool } = await import('./tools.js');
  return runTool(name, args);
}
