export const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
export const DEFAULT_SAVED_FILE_NAME = 'graphql_data.json'
export const TIME_30_SECONDS = 30000
export const TIME_20_SECONDS = 20000
export const TIME_10_SECONDS = 10000
export const TIME_5_SECONDS = 5000
export const TIME_0_SECONDS = 0
export const DEFAULT_PAGE_SIZE = 100
export const DEFAULT_MAX_ITEMS = 10

export const instructions = `
Usage:

    node index.ts --org <orgName> --pat <pat> [options]

    Required:
    --org <orgName> - The name of the organization to query. Ex: 'staticwebdev' or 'azure-samples'.
    --pat <pat>     - The personal access token to use for authentication. Or process.env.PAT.

    Optional:
    --verbose <true|false> - Whether to print verbose output. Defaults to false.
    --max <number>         - The maximum number of items to return, sorted by weight. Defaults to 1. -1 means all.
    --page <number>        - The number of items to return per page. Defaults to 10.
    --delay <number>       - The number of milliseconds to delay between requests. Defaults to 900.
    --prop <string>        - The property to return. Defaults to 'repositoryName'. 'all' means return all properties.
    --file <string>        - The file to write the output to. If file name is missing, defaults to 'graphql_data.json'.
    --top <number>         - The number of items to return, sorted by weight. Defaults to 1. -1 means all.
    --sort <string>        - The property to sort by. Defaults to 'weight'.
    --sortdir <string>     - The direction to sort by. Defaults to 'desc' for descending. 'asc' means ascending.
    --url <string>         - The GitHub GraphQL URL to use. Defaults to 'https://api.github.com/graphql'.
`
