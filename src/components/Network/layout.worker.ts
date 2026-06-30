import Cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

const registerLayout: (ext: Cytoscape.Ext) => void = Cytoscape.use.bind(Cytoscape);
registerLayout(fcose as Cytoscape.Ext);

type LayoutRequest = {
  elements: Cytoscape.ElementDefinition[];
  options: Record<string, unknown>;
};

self.onmessage = (e: MessageEvent<LayoutRequest>) => {
  const { elements, options } = e.data;

  const cy = Cytoscape({ headless: true, elements });
  const layout = cy.layout({ ...options, animate: false } as Cytoscape.LayoutOptions);

  layout.on("layoutstop", () => {
    const positions: Record<string, { x: number; y: number }> = {};
    cy.nodes().forEach((node) => {
      positions[node.id()] = node.position();
    });
    self.postMessage(positions);
    cy.destroy();
  });

  layout.run();
};
