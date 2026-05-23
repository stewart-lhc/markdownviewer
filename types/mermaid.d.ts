declare module "mermaid" {
  type MermaidRenderResult = {
    bindFunctions?: (element: Element) => void;
    svg: string;
  };

  type MermaidApi = {
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, text: string) => Promise<MermaidRenderResult>;
  };

  const mermaid: MermaidApi;
  export default mermaid;
}
