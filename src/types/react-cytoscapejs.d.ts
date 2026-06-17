declare module 'react-cytoscapejs' {
  import type Cytoscape from 'cytoscape'
  import type { CSSProperties, Component } from 'react'

  interface CytoscapeComponentProps {
    id?: string
    className?: string
    style?: CSSProperties
    elements: Cytoscape.ElementDefinition[]
    stylesheet?: object[]
    layout?: Cytoscape.LayoutOptions
    cy?: (cy: Cytoscape.Core) => void
    zoom?: number
    pan?: Cytoscape.Position
    panningEnabled?: boolean
    userPanningEnabled?: boolean
    minZoom?: number
    maxZoom?: number
    zoomingEnabled?: boolean
    userZoomingEnabled?: boolean
    boxSelectionEnabled?: boolean
    autoungrabify?: boolean
    autolock?: boolean
    autounselectify?: boolean
    wheelSensitivity?: number
    pixelRatio?: number | 'auto'
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {
    static normalizeElements(
      elements:
        | Cytoscape.ElementDefinition[]
        | { nodes?: Cytoscape.ElementDefinition[]; edges?: Cytoscape.ElementDefinition[] }
    ): Cytoscape.ElementDefinition[]
  }
}
