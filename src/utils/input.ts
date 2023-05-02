import { err, ok, Result } from 'neverthrow'
const noop = (_: string) => {}

export const isString = <T = any>(str: string | T): str is string => {
  return typeof str === 'string' && str.length > 0
}

export interface AppConfig {
  // required
  orgName: string
  pat: string

  // optional
  url: string // GitHub GraphQL URL
  verbose: boolean
  maxItems: number
  page: number
  delay: number
  top: number
  sort: string
  sortdir: string
  property: string
  file: string
  log: (msg: string) => void
}

export function getParameters(argv: any): Result<AppConfig, Error> {
  const orgName = argv['org']
  const pat = argv['pat'] || process?.env?.PAT
  const url = argv['url'] || 'https://api.github.com/graphql'

  if (isString(orgName) && isString(pat)) {
    const config: AppConfig = {
      orgName,
      pat,
      url,
      verbose: argv['verbose'] || false,
      maxItems: +argv['max'] || 1,
      page: +argv['page'] || 10,
      delay: +argv['delay'] || 900,
      top: +argv['top'] || 1,
      sort: argv['sort'] || 'weight',
      property: argv['prop'] || 'repositoryName',
      sortdir: argv['sortdir'] || 'desc',
      file: argv['file'] || 'graphql_data.json',
      log: !argv['verbose']
        ? noop
        : argv['verbose'] === 'true'
        ? console.log
        : noop
    }

    return ok(config)
  } else {
    const errors: string[] = []
    if (!isString(orgName)) {
      errors.push('orgName is required')
    }
    if (!isString(pat)) {
      errors.push('pat is required')
    }
    return err(
      new Error(`Missing required parameter(s)\n: ${errors.join('\n')}`)
    )
  }
}
