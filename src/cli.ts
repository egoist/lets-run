#!/usr/bin/env node
import fs from "fs"
import { execaCommand } from "execa"
import { cac } from "cac"
import { watch } from "chokidar"
import createDebug from "debug"

const cli = cac(`lets-run`)

const debug = createDebug("letsrun")

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

    const run = async () => {
      if (flags.onPathExists) {
        await onPathExists(flags.onPathExists)
      }
      await execaCommand(command!, { stdio: "inherit", preferLocal: true })
    }

    await run()

    if (flags.watch) {
      watch(flags.watch, { ignoreInitial: true }).on("all", run)
    }
  })

cli.parse()

function onPathExists(p: string) {
  if (fs.existsSync(p)) return

  debug(`Waiting for ${p} to exist`)
  return new Promise((resolve) => {
    const watcher = watch(p, {
      ignoreInitial: true,
      disableGlobbing: true,
      awaitWriteFinish: true,
    }).on("all", () => {
      watcher.close()
      resolve(true)
    })
  })
}
