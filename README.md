# mcp-pokemon

MCP server for Pokemon data via [PokeAPI](https://pokeapi.co/). Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `get_pokemon` | Get Pokemon details by name or ID (types, stats, abilities, sprites) |
| `get_type` | Get type effectiveness and damage relations |
| `get_ability` | Get ability details and which Pokemon have it |
| `get_evolution_chain` | Get the full evolution chain by chain ID |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "pokemon_get_pokemon",
      "arguments": { "name": "pikachu" }
    },
    "id": 1
  }'
```

## License

MIT
