/* tslint:disable no-string-literal promise-function-async */
import argv = require('yargs')
import { Options } from 'yargs'

import {
  assign,
  camelCase,
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

import { Blom, BlomOptions, State } from './types'

import { squeezeLines } from './utils'

import { blom } from './index'

const commands = {
  start: {
    command: 'start [options]',
    description: `
        Start application web server. Updates the browser on changes in
        development mode, and performs server-side rendering in production
        mode.`,
    options: [
      'verbose',
      'quiet',
      'watch',
      'context',
      'index-template',
      'devtool'
    ]
  },
  build: {
    command: 'build [options]',
    description: `Compiles the application for production deployment.`,
    options: [
      'verbose',
      'quiet',
      'watch',
      'context',
      'index-template',
      'devtool',
      'output-public-path',
      'output-path'
    ]
  }
}

const getOptions = (): { [key: string]: Options } => ({
  verbose: {
    type: 'count',
    describe: 'Increase logging level',
    alias: 'v'
  },
  quiet: {
    type: 'count',
    describe: 'Decrease logging level',
    alias: 'q'
  },
  watch: {
    type: 'boolean',
    describe: 'Watch files and recompile whenever they change',
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
    describe: "Point entry to your app's client entry file",
  },
  'entry-server': {
    type: 'string',
    describe: "Point entry to your app's server entry file",
  },
  'index-template': {
    type: 'string',
    describe: 'The landing page mustache template',
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

export const parse = async (handler: Blom) => {
  const options = getOptions()
  const sharedOptions = intersection(
    ...map(commands, command => command.options)
  )

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

  argv
    .usage('Usage: $0 <command> [options]')
    .help('help')
    .alias('help', 'h')
    .version()

  forOwn(
    mapValues(commands, (command): argv.CommandModule => ({
      command: command.command,
      describe: squeezeLines(command.description),
      handler: (props: Partial<BlomOptions>) =>
        handler(normalizeProps(props, command.options))
          .then(instance => instance.run())
          .catch(e => {
            logger.error(e.message)

            process.exit(1)
          }),
      builder: (yargs: argv.Argv): argv.Argv =>
        yargs.options(pick(options, command.options))
    })),
    (value, _) => argv.command(value)
  )

  // tslint:disable-next-line no-unused-expression
  argv
    .options(pick(options, sharedOptions))
    .epilogue(environmentHelp)
    .wrap(80)
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .strict().argv
}

parse(blom).catch(e => {
  logger.error(e.message)

  process.exit(1)
})
