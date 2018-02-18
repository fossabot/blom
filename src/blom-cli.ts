/* tslint:disable no-string-literal promise-function-async no-import-side-effect no-duplicate-imports */

// Yargs import breaks help
import yargs = require('yargs')
import { Arguments, Argv, Options } from 'yargs'

import {
  assign,
  camelCase,
  capitalize,
  difference,
  forOwn,
  intersection,
  keys,
  map,
  mapKeys,
  mapValues,
  omit,
  pick,
  times
} from 'lodash'

import { logger } from './logger'
import { BlomOptions } from './types'
import { squeezeLines } from './squeezeLines'

const commands = {
  start: {
    command: 'start [options]',
    description: `
        Start application web server. Updates the browser on changes in
        development mode, and performs server-side rendering in production
        mode.`,
    options: [
      'watch',
      'context',
      'index-template',
      'devtool',
      'static-assets',
      'entry-client',
      'entry-server'
    ]
  },
  build: {
    command: 'build [options]',
    description: `Compiles the application for production deployment.`,
    options: [
      'watch',
      'context',
      'index-template',
      'devtool',
      'static-assets',
      'entry-client',
      'entry-server',
      'output-public-path',
      'output-path'
    ]
  }
}

const getOptions = (): { [key: string]: Options } => ({
  watch: {
    type: 'boolean',
    describe: 'Watch files and recompile whenever they change'
  },
  'static-assets': {
    type: 'string',
    describe: 'The custom static assets directory path'
  },
  devtool: {
    type: 'string',
    describe:
      "Choose a style of source mapping to enhance the debugging process. Set to 'false' to disable"
  },
  'output-public-path': {
    type: 'string',
    describe: 'Public URL of the output directory when referenced in a browser'
  },
  'output-path': {
    type: 'string',
    describe: 'The output directory path'
  },
  context: {
    type: 'string',
    describe: 'The base directory, an absolute path'
  },
  'entry-client': {
    type: 'string',
    describe: "Point entry to your app's client entry file"
  },
  'entry-server': {
    type: 'string',
    describe: "Point entry to your app's server entry file"
  },
  'index-template': {
    type: 'string',
    describe: 'The index page template'
  },
  verbose: {
    type: 'count',
    describe: 'Increase logging level',
    alias: 'v'
  },
  quiet: {
    type: 'count',
    describe: 'Decrease logging level',
    alias: 'q'
  }
})

const environmentHelp = `Environment Variables:

  NODE_ENV    The NODE_ENV environment variable is set to 'development’
              by default. Set it to 'production' for production builds
  NODE_PORT   The port number to accept connections on
  NODE_HOST   The hostname to accept connections on
`

const setLogLevel = (i: number, d: number) => {
  logger.level = 'warn'

  times(i, () => logger.increaseLevel())
  times(d, () => logger.decreaseLevel())

  return logger.level
}

export const parse = async () => {
  const options = getOptions()
  const sharedOptions = intersection(
    ...map(commands, command => command.options)
  )

  // const handler = () => import('./index')

  const normalizeProps = (
    // tslint:disable-next-line no-any
    props: { [key: string]: any },
    include: string[]
  ): Partial<BlomOptions> =>
    assign(
      {},
      mapKeys(
        pick(
          omit(props, ['verbose', 'quiet', 'entry-client', 'entry-server']),
          intersection(keys(options), include)
        ),
        (_, key) => camelCase(key)
      ),
      { mode: props._[0] },
      { logLevel: setLogLevel(props.verbose, props.quiet) },
      { interactive: true },
      {
        entries: {
          client: props['entry-client'],
          server: props['entry-server']
        }
      }
    )

  const argv = yargs.usage('Usage: $0 <command> [options]')

  forOwn(
    mapValues(commands, (command, commandName) => ({
      command: command.command,
      description: squeezeLines(command.description),
      builder: (_argv: Argv) =>
        _argv.options(
          mapValues(
            pick(options, difference(command.options, sharedOptions)),
            v => {
              v.group = `${capitalize(commandName)} Options:`

              return v
            }
          )
        ),
      handler: (props: Arguments) => {
        import('./index')
          .then(handler =>
            handler
              .default(normalizeProps(props, command.options))
              .then(instance => instance.run())
              .catch(e => {
                logger.error(e.message)

                process.exit(1)
              })
          )
          .catch(e => {
            logger.error(e.message)

            process.exit(1)
          })
      }
    })),
    (value, _) =>
      argv.command(
        value.command,
        value.description,
        value.builder,
        value.handler
      )
  )

  // tslint:disable-next-line no-unused-expression
  yargs
    .options(
      mapValues(pick(options, sharedOptions), v => {
        v.group = 'Basic Options:'

        return v
      })
    )
    .help()
    .alias('h', 'help')
    .options(pick(options, ['verbose', 'quiet']))
    .version()
    .epilogue(environmentHelp)
    .wrap(80)
    .demandCommand(1, 'You need at least one command before moving on')
    .strict().argv
}

parse().catch(e => {
  logger.error(e.message)

  process.exit(1)
})
