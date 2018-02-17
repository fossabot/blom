declare namespace FindNpmPrefix {
  type FindNpmPrefix = (cwd: string) => Promise<string>
}

declare var findNpmPrefix: FindNpmPrefix.FindNpmPrefix

export = findNpmPrefix
