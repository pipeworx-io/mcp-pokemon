# mcp-pokemon

Pokemon MCP — wraps PokéAPI (free, no auth required)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_pokemon` | Get stats, types, abilities, height, weight, and sprites for a Pokémon. Lookup by name (e.g., "pikachu") or ID (e.g., "25"). |
| `get_type` | Check type effectiveness matchups and find Pokémon by type (e.g., "fire", "water"). Returns damage chart and up to 20 Pokémon. |
| `get_ability` | Look up a Pokémon ability (e.g., "static", "overgrow"). Returns effect description and all Pokémon that can have this ability. |
| `get_evolution_chain` | Trace a full evolution line by chain ID. Returns each stage with evolution triggers, level requirements, and items needed. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "pokemon": {
      "url": "https://gateway.pipeworx.io/pokemon/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Pokemon data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
