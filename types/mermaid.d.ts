declare module "mermaid" {
  type MermaidRenderResult = {
    bindFunctions?: (element: Element) => void;
    svg: string;
  };

  type MermaidApi = {
    initialize: (config: Record<string, unknown>) => void;
    render: (
      id: string,
      text: string,
      callback?: (svg: string, bindFunctions?: (element: Element) => void) => void,
      container?: HTMLElement
    ) => Promise<MermaidRenderResult> | MermaidRenderResult | string | void;
  };

  const mermaid: MermaidApi;
  export default mermaid;
}
