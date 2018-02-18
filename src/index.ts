import { Store, createStore as _createStore } from 'redux'
import iassign from 'immutable-assign'
import { join, resolve } from 'path'
import { logger } from './logger'

import {
  assign,
  defaultsDeep,
  filter,
  forEach,
  includes,
  isFunction,
  isString,
  isUndefined,
  join as _join,
  keys,
  pick,
  pickBy,
  some
} from 'lodash'

import { isDirectory, isFile, squeezeLines } from './utils'
import { BlomValidationError } from './errors'

import { getInitialState } from './initial-state'
import { setOptions } from './actions'

import {
  Action,
  ActionCreator,
  AnyAction,
  Blom,
  BlomEnvironment,
  BlomOptions,
  LogMessage,
  LogMessages,
  State
} from './types'

import { condDevelopment, condProduction, dependencies } from './selectors'

import { webpackDevelopmentServer, webpackProductionServer } from './webpack'

function isType<P>(
  action: AnyAction,
  actionCreator: ActionCreator<P>
): action is Action<P> {
  return action.type === actionCreator.type
}

const checkCondition = async (): Promise<{
  messages: LogMessages
  done: () => boolean
  put: (
    condition: () => Promise<boolean>,
    message: (() => LogMessage) | LogMessage,
    onSuccess?: () => void
  ) => Promise<void>
}> => {
  const messages: LogMessages = []

  return {
    put: async (condition, message, onSuccess?): Promise<void> => {
      const cond = await condition()
      const _message = isFunction(message) ? message() : message

      if (!cond) {
        messages.push({
          level: _message.level,
          message: squeezeLines(_message.message),
          meta: _message.meta
        })
      } else {
        if (isFunction(onSuccess)) {
          await onSuccess()
        }
      }
    },
    done: (): boolean => {
      forEach(messages, message =>
        logger[message.level](message.message, message.meta)
      )

      if (filter(messages, message => message.level === 'warn').length !== 0) {
        logger.log('')
      }

      if (filter(messages, message => message.level === 'error').length !== 0) {
        return false
      }

      return true
    },
    messages
  }
}

// tslint:disable-next-line max-func-body-length
const prepareOptions = async (
  options: BlomOptions & BlomEnvironment
): Promise<{
  options: BlomOptions & BlomEnvironment
  messages: LogMessages
  validation: () => boolean
}> => {
  const { done, put, messages } = await checkCondition()

  logger.level = options.logLevel

  const context = resolve(options.context)

  await put(
    async () => isDirectory(context),
    {
      level: 'error',
      message: `'context' does not describe a file system directory: '${
        options.context
      }'`
    },
    () => {
      options.context = context
    }
  )

  await put(
    async () => isFile(join(options.context, 'package.json')),
    {
      level: 'error',
      message: `'context' directory does not have a 'package.json': '${
        options.context
      }'`
    },
    () => {
      process.chdir(options.context)
    }
  )

  const entry = join(options.context, 'src/app.ts')

  await put(async () => isFile(entry), {
    level: 'error',
    message: `no such file: '${entry}'`
  })

  const entryClient = resolve(options.context, options.entries.client)

  await put(
    async () => isFile(entryClient),
    {
      level: 'error',
      message: `no such file: '${entryClient}'`
    },
    () => {
      options.entries.client = entryClient
    }
  )

  const entryServer = resolve(options.context, options.entries.client)

  await put(
    async () => isFile(entryServer),
    {
      level: 'error',
      message: `no such file: '${entryServer}'`
    },
    () => {
      options.entries.client = entryServer
    }
  )

  if (isString(options.staticAssets)) {
    const staticAssets = resolve(options.context, options.staticAssets)

    options.staticAssets = false

    await put(
      async () => isDirectory(staticAssets),
      {
        level: 'debug',
        message: `'staticAssets' does not describe a directory: '${staticAssets}'`
      },
      () => {
        options.staticAssets = staticAssets
      }
    )
  }

  const indexTemplate = resolve(options.context, options.indexTemplate)

  await put(
    async () => isFile(indexTemplate),
    {
      level: 'error',
      message: `'indexTemplate' does not describe a regular file: '${indexTemplate}'`
    },
    () => {
      options.indexTemplate = indexTemplate
    }
  )

  // TODO: host, port

  await put(
    async () =>
      includes(
        [
          'false',
          'eval',
          'cheap-eval-source-map',
          'cheap-module-eval-source-map',
          'eval-source-map',
          'cheap-source-map',
          'cheap-module-source-map',
          'inline-cheap-source-map',
          'inline-cheap-module-source-map',
          'source-map',
          'inline-source-map',
          'hidden-source-map',
          'nosources-source-map'
        ],
        options.devtool
      ),
    {
      level: 'error',
      message: `'devtool' is invalid: '${
        options.mode
      }. See https://webpack.js.org/configuration/devtool/'`
    }
  )

  await put(async () => includes(['start', 'build'], options.mode), {
    level: 'error',
    message: `'mode' is invalid: '${options.mode}'`
  })

  await put(
    async () => includes(['production', 'development'], options.nodeEnv),
    {
      level: 'error',
      message: `'nodeEnv' is invalid: '${options.nodeEnv}'`
    }
  )

  if (options.mode === 'build') {
    if (options.nodeEnv === 'development') {
      logger.verbose(
        'Build mode is only available in production environment, overriding'
      )

      options.nodeEnv = 'production'
      process.env.NODE_ENV = 'production'
    }
  }

  if (options.nodeEnv === 'development') {
    if (options.watch === false) {
      logger.verbose(
        "'watch' is always enabled in development environment, overriding"
      )

      options.watch = true
    }
  }

  return { options, validation: done, messages }
}

const pickOptions = (
  options: Partial<BlomOptions>,
  initial: State
): BlomOptions & BlomEnvironment =>
  defaultsDeep(
    options,
    pick(initial, [
      'entries',
      'context',
      'devtool',
      'host',
      'indexTemplate',
      'interactive',
      'logLevel',
      'mode',
      'nodeEnv',
      'outputPath',
      'outputPublicPath',
      'port',
      'staticAssets',
      'watch'
    ])
  )

const createStore = (initialState: State): Store<State> =>
  _createStore<State>((state, action: AnyAction) => {
    if (isType(action, setOptions)) {
      return iassign(state, s => assign(s, action.payload))
    }

    return state
  }, initialState)

const validateState = async (state: State): Promise<void> => {
  const { done, put, messages } = await checkCondition()

  let failedDependencies: string

  await put(
    async () => {
      const deps = pick(dependencies(state), state.requiredDependencies)
      const fail = some(deps, d => d === false)

      if (fail) {
        failedDependencies = _join(keys(pickBy(deps, d => d === false)), ' ')
      }

      return !fail
    },
    () => ({
      level: 'error',
      message: 'The following dependencies are missing:',
      meta: `npm install --save-dev ${failedDependencies}\n`
    })
  )

  if (!done()) {
    throw new BlomValidationError(
      'Blom validation error, cannot continue.',
      messages
    )
  }
}

export const blom: Blom = async (props, initialState?) => {
  logger.debug('Props', props)

  const initial: State = isUndefined(initialState)
    ? await getInitialState()
    : initialState

  const store = createStore(initial)

  const { options, validation, messages } = await prepareOptions(
    pickOptions(props, initial)
  )

  if (!validation()) {
    throw new BlomValidationError(
      'Blom validation error, cannot continue.',
      messages
    )
  } else {
    store.dispatch(setOptions(options))
  }

  const state = store.getState()

  logger.debug('Blom State', state)

  await validateState(state)

  if (condDevelopment(state)) {
    return webpackDevelopmentServer(state)
  }

  if (condProduction(state)) {
    return webpackProductionServer(state)
  }
}

export default blom
