import webpack = require('webpack')
import { AnyAction } from 'redux'
import { MinifyOptions } from 'uglifyjs-webpack-plugin'
import { Express } from 'express'
import { Compiler, Configuration, MultiCompiler } from 'webpack'
import { LoggerLevel } from '@escapace/logger'
import {
  Package
} from 'normalize-package-data'

export interface Action<P> extends AnyAction {
  type: string
  payload: P
  error?: boolean
}

export interface ActionCreator<P> {
  type: string
  (payload: P): Action<P>
}

export interface BlomOptions {
  entries: {
    client: string
    server: string
  }
  interactive: boolean
  context: webpack.Configuration['context']
  devtool: string
  indexTemplate: string
  logLevel: LoggerLevel
  mode: 'build' | 'start'
  outputPath: string
  outputPublicPath: string
  staticAssets: string | false
  watch: boolean
}

export interface BlomEnvironment {
  port: number
  host: string
  nodeEnv: string
}

export interface State extends BlomOptions, BlomEnvironment {
  packageJson: PackageJson,
  version: string,
  modulePaths: string[]
  assetsDirectory: string
  entries: {
    client: string
    server: string
    webpackHotMiddleware: string
    babelPolyfill: string
  }
  SSRClientFilename: string
  SSRServerFilename: string
  vueEnv: 'client' | 'server'
  uglifyOptions: MinifyOptions
  home: string
  postcssConfig: string
  extensions: {
    media: string[]
    image: string[]
    font: string[]
  }
}

export interface PackageJson extends Package {
  postcss: Object
}

export type LogMessageLevels = 'error' | 'warn' | 'debug'

export interface LogMessage {
  message: string
  meta?: Error
  level: LogMessageLevels
}

export type LogMessages = LogMessage[]

export interface BlomWebpackDevelopmentServerResolve {
  type: 'development-server'
  app: Express
  compiler: Compiler
  configuration: Configuration
  state: State
  run: () => Promise<() => Promise<void>>
}

export interface BlomWebpackProductionServerResolve {
  type: 'production-server'
  app: Express
  compiler: MultiCompiler
  configuration: Configuration[]
  state: State
  run: () => Promise<() => Promise<void>>
}

export type Blom = (
  props: Partial<BlomOptions>,
  initialState?: State
) => Promise<
  BlomWebpackDevelopmentServerResolve | BlomWebpackProductionServerResolve
>

export { AnyAction } from 'redux'
