export function getNextCursor(
  nextCursor: string | null | undefined
): string | undefined {
  if (nextCursor !== undefined && nextCursor !== null) {
    return nextCursor
  } else {
    undefined
  }
}
export function shouldGetNextPage(
  currentRowCount: number,
  maxRowCount: number,
  currentNextPageCursor: boolean,
  nextCursor: string | null | undefined
): boolean {
  if (
    maxRowCount === -1 || // get all rows
    (nextCursor &&
      currentRowCount < maxRowCount &&
      currentNextPageCursor !== undefined &&
      currentNextPageCursor === true)
  ) {
    return true
  } else {
    return false
  }
}

export type CursorState = {
  endCursor: string | undefined
  hasNextPage: boolean
}
export type IterationState = {
  currentRepoCount: number
  currentPageCount: number
}

export function getCursorState(
  currentState: IterationState,
  appConfig: { max_data: number },
  data: any,
  log: (string) => void
): CursorState {
  // Manage cursor for next page
  const endCursor = getNextCursor(
    data?.organization?.repositories?.pageInfo?.endCursor
  )

  // Collect enough data?
  const hasNextPage = shouldGetNextPage(
    currentState.currentRepoCount,
    appConfig.max_data,
    data.organization?.repositories.pageInfo.hasNextPage,
    data?.organization?.repositories?.pageInfo?.endCursor
  )
  log(
    `totalitems: ${currentState.currentRepoCount}, page: ${currentState.currentPageCount}, hasNextPage: ${hasNextPage}, cursor: ${endCursor}`
  )

  return {
    endCursor,
    hasNextPage
  }
}
