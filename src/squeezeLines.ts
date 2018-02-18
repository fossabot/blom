export const squeezeLines = (str: string) =>
  str.replace(/^(?:\r\n|\n|\r)+|(?:\r\n|\n|\r)+$/gm, '')
