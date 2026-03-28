# tree-sitter-sage

[Tree-sitter](https://tree-sitter.github.io/) grammar for the [Sage programming language](https://github.com/sagelang/sage).

Used by the [Zed extension](https://github.com/sagelang/sage-zed) for syntax highlighting, code folding, and indentation.

## Supported Syntax

- Agent declarations (`agent`, `supervisor`, `on start`, `on error`, lifecycle hooks)
- Functions (`fn`, `extern fn`, closures)
- Type definitions (`record`, `enum`, `const`)
- Control flow (`if`/`else`, `for`, `while`, `loop`, `match`)
- Agent operations (`summon`, `await`, `divine`, `yield`, `send`, `receive`)
- Error handling (`try`, `catch`, `fail`, `fails`)
- Module system (`mod`, `use`, `pub`)
- Tools (`use Http`, `use Database`, `use Fs`, `use Shell`)
- Testing (`test`, `mock`)
- Observability (`trace`, `span`)
- Protocols and session types (`protocol`, `follows`, `reply`)
- String interpolation, generics, tuples

## Usage

### Zed

The grammar is bundled with the [sage-zed](https://github.com/sagelang/sage-zed) extension. Install "Sage" from the Zed extension registry.

### Node.js

```bash
npm install tree-sitter-sage
```

```javascript
const Parser = require('tree-sitter');
const Sage = require('tree-sitter-sage');

const parser = new Parser();
parser.setLanguage(Sage);

const tree = parser.parse('agent Main { on start { yield(0); } }');
console.log(tree.rootNode.toString());
```

## Development

```bash
# Generate parser from grammar
npm run build

# Run tests
npm run test

# Parse a file
npx tree-sitter parse example.sg
```

## Queries

| File | Purpose |
|------|---------|
| `queries/highlights.scm` | Syntax highlighting |
| `queries/indents.scm` | Auto-indentation |

## License

MIT
