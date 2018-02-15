import parentPackageJson = require('parent-package-json')
import { PackageJson } from './types'
import { dirname, join } from 'path'
import { isUndefined, join as _join, map, replace, split, trim } from 'lodash'
import { logger } from './logger'
import { readFile, realpath, stat } from 'fs'
import { promisify } from 'util'

import Bluebird = require('bluebird')

export const readFileAsync = promisify(readFile)
export const statAsync = promisify(stat)
export const realpathAsync = promisify(realpath)

export const squeezeLines = (str: string) =>
  _join(
    map(split(str, /\r?\n/), line =>
      trim(replace(line, new RegExp('[s]{2,}', 'g'), ' '))
    ),
    ' '
  )

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

export const getPackageJson = async (): Promise<{
  path: string
  content: PackageJson
}> => {
  const path = join(process.cwd(), 'package.json')

  if (await isFile(path)) {
    return {
      path,
      content: JSON.parse(await readFileAsync(join(path), 'utf8'))
    }
  }

  const parent = parentPackageJson(process.cwd())

  if (parent) {
    return {
      path: dirname(parent.path),
      content: parent.parse() as PackageJson
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
