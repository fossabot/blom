import findNpmPerfix from 'find-npm-prefix'
import { join } from 'path'
import normalizePackage from 'normalize-package-data'
import pkgUp from 'pkg-up'
import { PackageJson } from './types'
import Bluebird from 'bluebird'
import {
  assign,
  compact,
  includes,
  isEmpty,
  isUndefined,
  keys,
  map,
  noop,
  uniq
} from 'lodash'
import { logger } from './logger'
import { promisify } from 'util'
import { readFile, realpath, stat } from 'fs'
import resolveFrom from 'resolve-from'

export { squeezeLines } from './squeezeLines'

export const readFileAsync = promisify(readFile)
export const statAsync = promisify(stat)
export const realpathAsync = promisify(realpath)

/**
 * Removes leading indents from a template string without removing all leading whitespace
 * Copyright 2016 Palantir Technologies, Inc.
 * Licensed under the Apache License, Version 2.0
 */

// tslint:disable-next-line no-any
export const dedent = (strings: TemplateStringsArray, ...values: any[]) => {
  let fullString = strings.reduce(
    (accumulator, str, i) => `${accumulator}${values[i - 1]}${str}`
  )

  // match all leading spaces/tabs at the start of each line
  const match = fullString.match(/^[ \t]*(?=\S)/gm)
  if (match === null) {
    // e.g. if the string is empty or all whitespace.
    return fullString
  }

  // find the smallest indent, we don't want to remove all leading whitespace
  const indent = Math.min(...match.map(el => el.length))
  const regexp = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  fullString = indent > 0 ? fullString.replace(regexp, '') : fullString

  return fullString
}

export const isFile = async (file: string): Promise<boolean> =>
  statAsync(file)
    // TODO: check permissions
    .then(res => {
      return res.isFile()
    })
    .catch(e => {
      logger.debug('blom(utils/isFile):', e)

      return false
    })

export const isDirectory = async (file: string): Promise<boolean> =>
  statAsync(file)
    // TODO: check permissions
    .then(res => {
      return res.isDirectory()
    })
    .catch(e => {
      logger.debug('blom(utils/isDirectory):', e)

      return false
    })

export const fileOrFallback = async (
  files: string[],
  fallback: string
): Promise<string> => {
  // tslint:disable-next-line await-promise
  const candidates = await Bluebird.filter(files, isFile)

  if (candidates.length === 0) {
    return fallback
  }

  return candidates[0]
}

// {
//   const found = (files, async file => isFile(file))
//
//   // Promise.map(files, file => isFile(file))
//
//   logger.log('found', { found })
//
//   return found || fallback
// }

// return fallback

export const packageWarn = (msg: string) =>
  logger.verbose(`package.json: ${msg}`)

export const normalizePackageJson = (
  data: PackageJson,
  warn: ((msg: string) => void) = packageWarn,
  strict: boolean = true
): PackageJson => {
  normalizePackage(data, warn, strict)

  return data
}

export const getBlomPackageJson = async (home: string): Promise<PackageJson> =>
  normalizePackageJson(
    JSON.parse(await readFileAsync(join(home, 'package.json'), 'utf8')),
    noop,
    false
  )

export const getPackageJson = async (): Promise<{
  path: string
  content: PackageJson
}> => {
  const path = await pkgUp(process.cwd())

  if (path) {
    return {
      path: path,
      content: normalizePackageJson(
        JSON.parse(await readFileAsync(path, 'utf8'))
      )
    }
  }

  throw new Error("No such file 'package.json'.")
}

export const getPostcssConfig = async (
  packageJson: PackageJson,
  context: string,
  home: string
): Promise<string> => {
  if (!isUndefined(packageJson.postcss)) {
    return context
  }

  return fileOrFallback(
    [
      join(context, 'postcss.config.js'),
      join(context, '.postcssrc.js'),
      join(context, '.postcssrc.json'),
      join(context, '.postcssrc.yaml'),
      join(context, '.postcssrc')
    ],
    join(home, 'postcss.config.js')
  )
}

export const getModulePaths = async (
  context: string,
  home: string
): Promise<string[]> => {
  const modulePaths = Bluebird.filter(
    map(uniq([await findNpmPerfix(context), await findNpmPerfix(home)]), d =>
      join(d, 'node_modules')
    ),
    isDirectory
  )

  if (isEmpty(modulePaths)) {
    throw new Error('Module path disovery fail')
  }

  return modulePaths
}

export const resolveModule = (
  moduleId: string,
  modulePaths: string[]
): string | boolean => {
  const modulePath = uniq(
    compact(map(modulePaths, path => resolveFrom.silent(path, moduleId)))
  )

  if (isEmpty(modulePath)) {
    throw new Error(`Failed to resolve '${moduleId}'`)
  }

  return modulePath[0]
}

export const hasModule = (moduleId: string, modulePaths: string[]): boolean => {
  try {
    resolveModule(moduleId, modulePaths)

    return true
  } catch {
    return false
  }
}

export const checkDependency = (
  dependency: string,
  packageJson: PackageJson,
  modulePaths: string[]
): boolean =>
  includes(
    keys(assign({}, packageJson.dependencies, packageJson.devDependencies)),
    dependency
  ) && hasModule(dependency, modulePaths)
