import { join, map, replace, split, trim } from 'lodash'

export const squeezeLines = (str: string) =>
  join(
    map(split(str, /\r?\n/), line =>
      trim(replace(line, new RegExp('[s]{2,}', 'g'), ' '))
    ),
    ' '
  )
