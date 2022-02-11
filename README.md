**💛 You can help the author become a full-time open-source maintainer by [sponsoring him on GitHub](https://github.com/sponsors/egoist).**

---

# lets-run

[![npm version](https://badgen.net/npm/v/lets-run)](https://npm.im/lets-run) [![npm downloads](https://badgen.net/npm/dm/lets-run)](https://npm.im/lets-run)

## Install

```bash
npm i lets-run -D
```

## Usage

Run a command and watch files to rerun on changes:

```bash
lets-run "node dist/server.js" --watch "dist"
```

In a monorepo where one package depends on the output files of another package, you can use `--on-path-exists <path>` flag:

```bash
lets-run "node dist/server.js" \
    --watch "dist" \
    --watch "../packages/another-package/dist" \
    --on-path-exists "../packages/another-package/dist"
```

## Sponsors

[![sponsors](https://sponsors-images.egoist.sh/sponsors.svg)](https://github.com/sponsors/egoist)

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
