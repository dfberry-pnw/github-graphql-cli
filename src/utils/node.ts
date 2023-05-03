export type FinishedRepository = {
  repositoryName: string
  id: string
  url: string
  descriptionHTML: string
  isArchived: boolean
  isEmpty: boolean
  isPrivate: boolean
  isTemplate: boolean
  isDisabled: boolean
  createdAt: Date
  updatedAt: Date
  pushedAt: Date
  diskUsage: number
  languages: string[]
  watchers: number
  stargazers: number
  forks: number
  open_issues: number
  open_prs: number
  weight: number
}

export function convertIntoFinishedRepository(node: any): FinishedRepository {
  const finNode: FinishedRepository = new Object() as FinishedRepository

  if (node && node.createdAt) {
    finNode.repositoryName = node.repositoryName
    finNode.id = node.id
    finNode.url = node.url
    finNode.descriptionHTML = node.descriptionHTML
    finNode.isArchived = node.isArchived
    finNode.isEmpty = node.isEmpty
    finNode.isPrivate = node.isPrivate
    finNode.isTemplate = node.isTemplate
    finNode.isDisabled = node.isDisabled
    finNode.createdAt = new Date(node.createdAt)
    finNode.updatedAt = new Date(node.updatedAt)
    finNode.pushedAt = new Date(node.pushedAt)
    finNode.diskUsage = node.diskUsage

    if (node?.languages?.edges) {
      finNode.languages = node?.languages?.edges
        ?.map((n) => n?.node.name)
        .sort()
    }

    finNode.watchers = node?.watchers?.totalCount || 0
    finNode.stargazers = node?.stargazers?.totalCount || 0
    finNode.forks = node?.forks?.totalCount || 0
    finNode.open_issues = node?.open_issues?.totalCount || 0
    finNode.open_prs = node?.open_prs?.totalCount || 0
    finNode.weight =
      finNode.watchers +
      finNode.stargazers +
      finNode.forks +
      finNode.open_issues +
      finNode.open_prs
  }
  return finNode
}
