declare module "prismjs" {
  export type Grammar = Record<string, any>;

  type PrismApi = {
    highlight: (text: string, grammar: Grammar, language: string) => string;
  };

  const Prism: PrismApi;
  export default Prism;
}
