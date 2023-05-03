import path from 'path'
import fs from 'fs/promises'

import cloneDeep from 'lodash.clonedeep'

import { AppConfig } from './input'
export type PostProcessingIncomingParams = {
  appConfig: AppConfig
  data: any[]
}

export enum SortDir {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 *
 * @param sort - optional - name of property to sort by
 * @param sortdir
 * @param data
 * @param log
 * @returns new array
 */
export function sortData({
  appConfig,
  data
}: PostProcessingIncomingParams): PostProcessingIncomingParams {
  let copy = cloneDeep(data)

  if (appConfig.sort) {
    if (appConfig.sortdir == 'asc') {
      appConfig.log(`Sorted by ${appConfig.sort} ${appConfig.sortdir}`)
      copy = copy.sort((a, b) => a[appConfig.sort] - b[appConfig.sort])
    } else {
      appConfig.log(`Sorted by ${appConfig.sort} ${appConfig.sortdir}`)
      copy = copy.sort((a, b) => b[appConfig.sort] - a[appConfig.sort])
    }
  } else {
    appConfig.log(`No sort requested`)
  }
  appConfig.log(
    `First ${appConfig.sort}: ${copy[0][appConfig.sort]}, Last ${
      appConfig.sort
    }: ${copy[copy.length - 1][appConfig.sort]}`
  )
  return { appConfig, data: copy }
}
export function topData({
  appConfig,
  data
}: PostProcessingIncomingParams): PostProcessingIncomingParams {
  let copy = cloneDeep(data)

  if (appConfig.top !== -1) {
    appConfig.log(`Returning top ${appConfig.top}/${copy.length} items`)
    copy = copy.slice(0, appConfig.top)
  } else if (appConfig.maxItems !== -1) {
    appConfig.log(`Returning max ${appConfig.maxItems}/${copy.length} items`)
    copy = copy.slice(0, appConfig.maxItems)
  } else {
    appConfig.log(`Returning all ${copy.length} items`)
  }
  return { appConfig, data: copy }
}
export function reduceData({
  appConfig,
  data
}: PostProcessingIncomingParams): PostProcessingIncomingParams {
  const copy = cloneDeep(data)

  if (appConfig.property !== 'all') {
    const reducedData = data.map((x) => x[appConfig.property])
    appConfig.log(`Returning '${appConfig.property}' property values`)
    return { appConfig, data: reducedData }
  } else {
    appConfig.log(`Returning all property values`)
  }
  return { appConfig, data: copy }
}
export async function saveDataToFile({
  appConfig,
  data
}: PostProcessingIncomingParams): Promise<PostProcessingIncomingParams> {
  if (appConfig.file) {
    const fileWithPath = path.join(__dirname, `../${appConfig.file}`)
    await fs.writeFile(fileWithPath, JSON.stringify(data))
    appConfig.log(`Wrote output to ${fileWithPath}`)
  } else {
    appConfig.log(`Output to console`)
    console.log(JSON.stringify(data))
  }
  return { appConfig, data }
}
