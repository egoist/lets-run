#!/usr/bin/env node
import fs from "fs"
import path from "path"
import { ExecaChildProcess, execaCommand } from "execa"
import { cac } from "cac"
import { watch } from "chokidar"
import createDebug from "debug"
import kill from "tree-kill"

const cli = cac(`lets-run`)

const debug = createDebug("letsrun")

const killPromise = (pid: number) =>
  new Promise((resolve, reject) =>
    kill(pid, (error) => {
      if (error) return reject(error)
      return resolve(true)
    }),
  )

cli
  .command("[command]", "Run a command")
  .option(
    "--on-path-exists <path>",
    "Run the command when specific path exists",
  )
  .option("-w, --watch <path>", "Watch a path or multiple paths for changes")
  .action(async (command: string | undefined, flags: Record<string, any>) => {
    command = command || (flags["--"] || []).join(" ")
    if (!command) return cli.outputHelp()

    let cmd: ExecaChildProcess | undefined

    const run = async () => {
      if (flags.onPathExists) {
        await onPathExists(flags.onPathExists)
      }
      if (cmd && cmd.pid) {
        await killPromise(cmd.pid)
      }
      cmd = execaCommand(command!, { stdio: "inherit", preferLocal: true })
    }

    await run()

    if (flags.watch) {
      watch(flags.watch, { ignoreInitial: true }).on("all", run)
    }
  })

cli.parse()

function onPathExists(p: string) {
  const paths = ([] as string[]).concat(p).map((p) => path.resolve(p))

  if (paths.every((p) => fs.existsSync(p))) return

  debug(`Waiting for ${paths.join(", ")} to exist`)

  const found: Set<string> = new Set()

  return new Promise((resolve) => {
    const watcher = watch(p, {
      ignoreInitial: true,
      disableGlobbing: true,
    }).on("all", (event, filepath) => {
      found.add(path.resolve(filepath))
      if (paths.every((p) => found.has(p))) {
        watcher.close()
        resolve(true)
      }
    })
  })
}
