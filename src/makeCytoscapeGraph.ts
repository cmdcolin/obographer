import { idMaker } from './util'

type Node = {
  id: string
  lbl: string
  parents: string[]
  children: string[]
  [key: string]: any
}

type NodeMap = {
  [key: string]: Node
}

type CytoscapeNode = {
  data: {
    id: string
    label: string
  }
}

type CytoscapeEdge = {
  data: {
    source: string
    target: string
    label: string
  }
}

type CytoscapeElement = CytoscapeNode | CytoscapeEdge

export function makeCytoscapeGraph(
  nodes: NodeMap | undefined,
  nodeId: string,
): CytoscapeElement[] | undefined {
  if (!nodes) {
    return undefined
  }
  
  const currentNode = nodes[nodeId]
  if (!currentNode) {
    return undefined
  }

  const visited = new Set<string>()
  const visited2 = new Set<string>()
  const resultNodes: { label: string; id: string }[] = []
  const resultEdges: { source: string; target: string; label: string }[] = []

  function traverseParents(nodeId: string) {
    if (visited.has(nodeId)) {
      return
    }

    visited.add(nodeId)
    resultNodes.push({
      id: nodeId,
      label: nodes?.[nodeId].lbl || '',
    })

    const node = nodes![nodeId]
    if (node?.parents) {
      for (const parentId of node.parents) {
        const parentNodeId = idMaker(parentId)
        resultEdges.push({
          source: nodeId,
          target: parentId,
          label: '',
        })
        traverseParents(parentNodeId)
      }
    }
  }

  function traverseChildren(nodeId: string) {
    if (visited2.has(nodeId)) {
      return
    }

    visited2.add(nodeId)
    resultNodes.push({
      id: nodeId,
      label: nodes![nodeId].lbl,
    })

    const node = nodes![nodeId]
    if (node?.children) {
      for (const childId of node.children) {
        const childNodeId = idMaker(childId)
        resultEdges.push({
          source: childId,
          target: nodeId,
          label: '',
        })
        traverseChildren(childNodeId)
      }
    }
  }

  traverseParents(nodeId)
  traverseChildren(nodeId)

  const elements: CytoscapeElement[] = [
    ...resultNodes.map(node => ({ data: node }) as CytoscapeNode),
    ...resultEdges.map(edge => ({ data: edge }) as CytoscapeEdge),
  ]

  return elements
}
