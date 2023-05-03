import { err, ok, Result } from 'neverthrow'

import { reposQueryGraphQlSDK } from './sdkQuery'
import { CursorState, getCursorState, IterationState } from './utils/cursor'
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

    const cursorState: CursorState = {
      endCursor: undefined,
      hasNextPage: true
    }
    const iterationState: IterationState = {
      currentRepoCount: 0,
      currentPageCount: 0
    }

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
      iterationState.currentPageCount += 1

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

        const cursorState: CursorState = getCursorState(
          iterationState,
          { max_data },
          data,
          log
        )

        // Manage cursor for next page

        variables.after = cursorState.endCursor
        if (variables.after === undefined) {
          log(`no more data`)
          break
        }

        iterationState.currentRepoCount += reposExtendedDirty.length
        if (max_data !== -1 && iterationState.currentRepoCount > max_data) {
          log(`currentRepoCount is greater than max_data`)
          break
        }

        // rate limit - TBD: Fix this
        if (cursorState.hasNextPage && rate_limit_ms > 0) {
          log(`waiting ${rate_limit_ms}`)
          await waitfor(rate_limit_ms)
        }
      } else {
        log(`edges not returned`)
      }
    } while (cursorState.hasNextPage)

    // Sort by weight descending
    //reposList.sort((a, b) => b.weight - a.weight)

    log(`paging finished`)
    return ok({ data: reposList })
  }
}
