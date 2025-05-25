import { idMaker } from './util'

/**
 * Parses OBO Graph JSON format into a node map with parent-child relationships
 * @param ontology The ontology data containing graphs with nodes and edges
 * @returns A map of nodes with their relationships or undefined if no ontology is provided
 */
export function parseOboGraphJson(ontology: { graphs: { nodes: { id: string; lbl: string }[]; edges: { sub: string; obj: string }[] }[] } | undefined) {
  if (ontology) {
    const nodes = Object.fromEntries(
      ontology.graphs[0].nodes.map(r => {
        const id = idMaker(r.id)
        return [
          id,
          {
            ...r,
            id,
            parents: [] as string[],
            children: [] as string[],
          },
        ]
      }),
    )
    for (const edge of ontology.graphs[0].edges) {
      nodes[idMaker(edge.sub)]?.parents.push(idMaker(edge.obj))
      nodes[idMaker(edge.obj)]?.children.push(idMaker(edge.sub))
    }
    return nodes
  } else {
    return undefined
  }
}

