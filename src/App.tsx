import { useEffect, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'

cytoscape.use(dagre)

// Custom hook to fetch the GO ontology file
function useGoOntology() {
  const [ontology, setOntology] = useState()
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

function App() {
  const [val, setVal] = useState('')
  const { ontology, loading, error } = useGoOntology()

  console.log({ ontology })
  // const r = ontology.graph.nodes.map(r => {})
  // Default elements for the graph
  const elements = [
    { data: { id: 'one', label: 'Node 1' } },
    { data: { id: 'two', label: 'Node 2' } },
    {
      data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={val}
          onChange={event => setVal(event.target.value)}
        />
        <div>
          {loading && <p>Loading GO ontology...</p>}
          {error ? <p style={{ color: 'red' }}>Error: {`${error}`}</p> : null}
          {ontology ? <p>GO ontology loaded successfully!</p> : null}
        </div>
      </div>
      <CytoscapeComponent
        elements={elements}
        style={{
          width: '1800px',
          height: '1000px',
        }}
        layout={{ name: 'dagre' }}
      />
    </div>
  )
}

export default App
