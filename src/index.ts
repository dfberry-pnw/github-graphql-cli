import fs from 'fs/promises'
import path from 'path'

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { err, ok, Result } from 'neverthrow'

import { QueryResponseData, reposCursorMgr } from './query'

import {
  reduceData,
  saveDataToFile,
  sortData,
  topData
} from './utils/postprocess'
import { AppConfig, getParameters } from './utils/input'
import { instructions } from './utils/constants'
import { pipe } from './utils/pipe'

const argv = yargs(hideBin(process.argv)).argv

async function main(): Promise<string> {
  const appConfigResult = getParameters(argv)

  if (appConfigResult.isErr()) {
    const errors = appConfigResult.error.message.split('\n')
    return errors + instructions
  } else {
    const appConfig = appConfigResult.value

    appConfig.log(`orgName: ${appConfig.orgName}`)
    appConfig.log(`pat: ${appConfig.pat.substring(0, 8)}...`)
    appConfig.log(`maxItems: ${appConfig.maxItems}`)
    appConfig.log(`page: ${appConfig.page}`)
    appConfig.log(`top: ${appConfig.top}`)
    appConfig.log(`delay: ${appConfig.delay}`)
    appConfig.log(`sort: ${appConfig.sort}`)
    appConfig.log(`sortdir: ${appConfig.sortdir}`)
    appConfig.log(`property: ${appConfig.property}`)
    appConfig.log(`file: ${appConfig.file}`)

    const result: Result<QueryResponseData, Error> = await reposCursorMgr(
      appConfig.pat,
      appConfig.url,
      appConfig.orgName,
      appConfig.maxItems,
      appConfig.page,
      appConfig.delay,
      appConfig.log
    )

    if (result.isErr()) {
      return result.error.message + instructions
    } else {
      const data = result.value.data

      const results = pipe({ appConfig, data }, sortData, topData, reduceData)

      // const sortedData = sortData(appConfig, data)
      // const toppedData = topData(appConfig, sortedData)
      // const reducedData = reduceData(appConfig, toppedData)
      await saveDataToFile(results)

      return `Process completed successfully\n\n` + instructions
    }
  }
}
main()
  .then((result: string) => {
    console.log(result)
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
