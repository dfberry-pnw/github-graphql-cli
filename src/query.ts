import { err, ok, Result } from 'neverthrow'

import { reposQueryGraphQlSDK } from './sdkQuery'
import { getNextCursor, shouldGetNextPage } from './utils/cursor'
import { waitfor } from './utils/utils'
import { IOrgReposQuery } from './generated/graphql.sdk'

import { convertIntoFinishedRepository, FinishedRepository } from './utils/node'

type ResponseBody = FinishedRepository[]
export interface QueryResponseData {
  data: ResponseBody
}

/**
 * Org Repos extended (last commit, pr, issue)
 * @param sdk
 * @param pat
 * @param org_name such as 'Azure-samples'
 * @max_data how many repos to return, -1 means all
 * @page_size 100 items max for GiHub
 * @rate_limit_ms impose rate limit for query
 * @returns
 */
export async function reposCursorMgr(
  pat: string,
  gitHubGraphQLUrl: string,
  org_name: string,
  max_data: number, // Number of repos to return in total, -1 means all data
  page_size: number, // Max page size for GitHub
  rate_limit_ms: number,
  log: (msg: string) => void
): Promise<Result<QueryResponseData, Error>> {
  if (!gitHubGraphQLUrl || !pat || !org_name) {
    return err(
      new Error(
        `missing parameters: pat: '${!!pat}', gitHubGraphQLUrl: '${!!gitHubGraphQLUrl}', org_name: '${!!org_name}'`
      )
    )
  } else {
    const variables: any = {
      organization: org_name,
      pageSize: page_size,
      after: null
    }
    log(`created variables`)

    let hasNextPage = false
    let currentData = 0
    let currentPage = 0
    const reposList: FinishedRepository[] = []

    do {
      log(`variables ${JSON.stringify(variables)}`)

      let data: IOrgReposQuery

      try {
        data = await reposQueryGraphQlSDK(gitHubGraphQLUrl, pat, variables)
      } catch (err: unknown) {
        console.log(`Query Error for ${JSON.stringify(variables)}`)
        throw err
      }

      log(`data returned`)
      currentPage += 1

      // Get repos
      if (data?.organization?.repositories?.edges) {
        const reposExtendedDirty = data?.organization.repositories.edges.map(
          (edge) => {
            // elevate nested data
            const node = edge?.node
            const finishedRepository = convertIntoFinishedRepository(node)
            return finishedRepository
          }
        )

        reposList.push(...reposExtendedDirty)

        // Manage cursor for next page
        variables.after = getNextCursor(
          data?.organization?.repositories?.pageInfo?.endCursor
        )
        currentData += reposExtendedDirty.length
        if (variables.after === undefined) {
          log(
            `totalitems: ${currentData}, page: ${currentPage}, hasNextPage: ${hasNextPage}, cursor- === undefined`
          )
          break
        }
        if (max_data !== -1 && currentData > max_data) {
          log(
            `totalitems: ${currentData}, page: ${currentPage}, hasNextPage: ${hasNextPage}, max_data reached`
          )
          break
        }

        // Collect enough data?
        hasNextPage = shouldGetNextPage(
          currentData,
          max_data,
          data.organization?.repositories.pageInfo.hasNextPage,
          data?.organization?.repositories?.pageInfo?.endCursor
        )
        log(
          `totalitems: ${currentData}, page: ${currentPage}, hasNextPage: ${hasNextPage}, cursor: ${variables.after}`
        )

        // rate limit - TBD: Fix this
        if (hasNextPage && rate_limit_ms > 0) {
          log(`waiting ${rate_limit_ms}`)
          await waitfor(rate_limit_ms)
        }
      } else {
        log(`edges not returned`)
      }
    } while (hasNextPage)

    // Sort by weight descending
    //reposList.sort((a, b) => b.weight - a.weight)

    log(`paging finished`)
    return ok({ data: reposList })
  }
}
