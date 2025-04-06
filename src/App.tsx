import { useEffect, useMemo, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import COSEBilkent from 'cytoscape-cose-bilkent'

cytoscape.use(COSEBilkent)

cytoscape.use(dagre)

interface Graph {
  nodes: { id: string; lbl: string }[]
  edges: { sub: string; obj: string }[]
}

// Custom hook to fetch the GO ontology file
function useGoOntology() {
  const [ontology, setOntology] = useState<{
    graphs: Graph[]
  }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    const fetchOntology = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = 'go-basic.json'
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} fetching ${url}`)
        }
        const data = await response.json()
        setOntology(data)
      } catch (err) {
        setError(err)
        console.error('Error fetching GO ontology:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOntology()
  }, [])

  return { ontology, loading, error }
}

function idMaker(r: string) {
  return r.replace('http://purl.obolibrary.org/obo/', '').replace('_', ':')
}

function App() {
  const [val, setVal] = useState('GO:0045010')
  const { ontology, loading, error } = useGoOntology()

  console.log({ ontology })

  const nodes = useMemo(() => {
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
  }, [ontology])
  const m = useMemo(() => {
    if (nodes) {
      const currentNode = nodes[val]
      if (!currentNode) {
        return undefined
      }

      const visited = new Set<string>()
      const visited2 = new Set<string>()
      const resultNodes: { label: string; id: string }[] = []
      const resultEdges: { source: string; target: string; label: string }[] =
        []

      function traverseParents(nodeId: string) {
        if (visited.has(nodeId)) {
          return
        }

        visited.add(nodeId)
        resultNodes.push({
          id: nodeId,
          label: nodes?.[nodeId].lbl,
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
              color: 'red',
            })
            traverseChildren(childNodeId)
          }
        }
      }

      traverseParents(val)
      traverseChildren(val)
      return {
        resultNodes,
        resultEdges,
      }
    } else {
      return undefined
    }
  }, [nodes, val])

  const elements = m
    ? [
        ...m.resultNodes.map(m => ({ data: m })),
        ...m.resultEdges.map(m => ({ data: m })),
      ]
    : undefined

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={val}
          onChange={event => setVal(event.target.value)}
        />
        <div>
          {loading ? <p>Loading GO ontology...</p> : null}
          {error ? <p style={{ color: 'red' }}>Error: {`${error}`}</p> : null}
          {ontology ? <p>GO ontology loaded successfully!</p> : null}
        </div>
      </div>
      {elements ? (
        <CytoscapeComponent
          elements={elements}
          style={{
            width: '1800px',
            height: '1000px',
          }}
          layout={{
            name: 'dagre',
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: true,
          }}
        />
      ) : null}
    </div>
  )
}

export default App
