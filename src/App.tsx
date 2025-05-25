import { useState, useMemo } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import COSEBilkent from 'cytoscape-cose-bilkent'
import useSWR from 'swr'
import { jsonfetch } from './util'
import { parseOboGraphJson } from './parseOboGraphJson'
import { makeCytoscapeGraph } from './makeCytoscapeGraph'

import type { Graph } from './types'

cytoscape.use(COSEBilkent)
cytoscape.use(dagre)

function App() {
  const [val, setVal] = useState('GO:0045010')
  const url = 'go-basic.json'
  const {
    data: ontology,
    isLoading,
    error,
  } = useSWR(url, () => jsonfetch<{ graphs: Graph[] }>(url))

  const nodes = useMemo(() => parseOboGraphJson(ontology), [ontology])
  const elements = useMemo(
    () => (nodes ? makeCytoscapeGraph(nodes, val) : undefined),
    [nodes, val],
  )

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={val}
          onChange={event => setVal(event.target.value)}
        />
        <div>
          {isLoading ? <p>Loading GO ontology...</p> : null}
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
