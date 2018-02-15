/* tslint:disable strict-boolean-expressions */

import { State } from './types'

import { dirname, join } from 'path'

import {
  fileOrFallback,
  getPackageJson,
  getPostcssConfig,
  realpathAsync
} from './utils'

import { isString } from 'lodash'

import resolveFrom = require('resolve-from')

export const getInitialState = async (): Promise<State> => {
  const packageJson = await getPackageJson()
  const context = dirname(await realpathAsync(packageJson.path))
  const home = await realpathAsync(dirname(__dirname))

  const indexTemplate = await fileOrFallback(
    [join(context, 'index.mustache')],
    join(home, 'index.mustache')
  )

  const postcssConfig = await getPostcssConfig(
    packageJson.content,
    context,
    home
  )

  const contextTypescript = resolveFrom.silent(context, 'typescript')

  const entries = {
    webpackHotMiddleware: join(
      home,
      'entries',
      'blom-webpack-hot-middleware.ts'
    ),
    babelPolyfill: join(home, 'entries', 'blom-babel-polyfill.ts'),
    client: join(context, 'src', 'entry-client.ts'),
    server: join(context, 'src', 'entry-server.ts')
  }

  return {
    assetsDirectory: 'assets',
    interactive: false,
    logLevel: 'silent',
    entries,
    SSRClientFilename: '.ssr/vue-ssr-client-manifest.json',
    SSRServerFilename: '.ssr/vue-ssr-server-bundle.json',
    uglifyOptions: {
      output: {
        comments: /^\**!|@preserve|@license|@cc_on/
      },
      safari10: true,
      warnings: false
    },
    context,
    devtool:
      process.env.NODE_ENV === 'development'
        ? 'cheap-module-eval-source-map'
        : 'nosources-source-map',
    watch: process.env.NODE_ENV === 'development' ? true : false,
    home: dirname(__dirname),
    host: process.env.NODE_HOST || '127.0.0.1',
    indexTemplate,
    mode: 'start',
    nodeEnv: process.env.NODE_ENV || 'development',
    outputPath: 'build',
    outputPublicPath: '/',
    port: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT, 10) : 8000,
    postcssConfig,
    staticAssets: 'static',
    typescript: isString(contextTypescript)
      ? contextTypescript
      : require.resolve('typescript'),
    extensions: {
      media: ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'aac'],
      font: ['woff', 'woff2', 'eot', 'ttf', 'otf'],
      image: ['png', 'jpg', 'jpeg', 'gif', 'svg']
    }
  }
}
