export interface Graph {
  nodes: { id: string; lbl: string }[]
  edges: { sub: string; obj: string }[]
}
