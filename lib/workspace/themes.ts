export type WorkspaceTheme =
  | "paper"
  | "primer"
  | "manuscript"
  | "sepia"
  | "porcelain"
  | "aurora"
  | "night"
  | "graphite"
  | "evergreen"
  | "terminal";

type ExportThemeTokens = {
  accent: string;
  background: string;
  bodyFont: string;
  bodySize: string;
  border: string;
  codeBackground: string;
  codeChrome: string;
  codeText: string;
  heading: string;
  headingFont: string;
  lineHeight: string;
  link: string;
  maxWidth: string;
  muted: string;
  quoteBackground: string;
  quoteBorder: string;
  radius: string;
  shadow: string;
  surface: string;
  tableHeader: string;
  tableStripe: string;
  text: string;
};

export const defaultWorkspaceTheme: WorkspaceTheme = "paper";

export const workspaceThemeOptions: Array<{
  description: string;
  export: ExportThemeTokens;
  id: WorkspaceTheme;
  label: string;
}> = [
  {
    id: "paper",
    label: "Paper",
    description: "Warm editorial daylight",
    export: {
      accent: "#d25b31",
      background: "linear-gradient(180deg, #f6f1e8 0%, #ebe1d0 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(28, 31, 35, 0.12)",
      codeBackground: "#111317",
      codeChrome: "#1c2028",
      codeText: "#e9edf5",
      heading: "#18181c",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.72",
      link: "#1a5fb4",
      maxWidth: "880px",
      muted: "#5b5b62",
      quoteBackground: "rgba(210, 91, 49, 0.08)",
      quoteBorder: "rgba(210, 91, 49, 0.42)",
      radius: "20px",
      shadow: "0 24px 80px rgba(49, 31, 19, 0.12)",
      surface: "rgba(255, 255, 255, 0.94)",
      tableHeader: "rgba(245, 238, 228, 0.92)",
      tableStripe: "rgba(250, 247, 242, 0.88)",
      text: "#2c2f35"
    }
  },
  {
    id: "primer",
    label: "Primer",
    description: "Clean README documentation",
    export: {
      accent: "#0969da",
      background: "#f6f8fa",
      bodyFont: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
      bodySize: "16px",
      border: "#d0d7de",
      codeBackground: "#f6f8fa",
      codeChrome: "#eef2f6",
      codeText: "#24292f",
      heading: "#1f2328",
      headingFont: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
      lineHeight: "1.65",
      link: "#0969da",
      maxWidth: "980px",
      muted: "#57606a",
      quoteBackground: "transparent",
      quoteBorder: "#d0d7de",
      radius: "10px",
      shadow: "0 12px 30px rgba(31, 35, 40, 0.08)",
      surface: "#ffffff",
      tableHeader: "#f6f8fa",
      tableStripe: "#f6f8fa",
      text: "#24292f"
    }
  },
  {
    id: "manuscript",
    label: "Manuscript",
    description: "Academic serif typesetting",
    export: {
      accent: "#75523a",
      background: "#f3eee3",
      bodyFont: "Georgia, \"Times New Roman\", serif",
      bodySize: "18px",
      border: "rgba(75, 55, 37, 0.18)",
      codeBackground: "#f1eadf",
      codeChrome: "#e9dece",
      codeText: "#3d2e22",
      heading: "#1f1812",
      headingFont: "\"Iowan Old Style\", Georgia, \"Times New Roman\", serif",
      lineHeight: "1.84",
      link: "#7b4c2d",
      maxWidth: "760px",
      muted: "#6d5b4d",
      quoteBackground: "rgba(117, 82, 58, 0.08)",
      quoteBorder: "rgba(117, 82, 58, 0.5)",
      radius: "6px",
      shadow: "0 18px 60px rgba(68, 48, 27, 0.12)",
      surface: "#fffdf7",
      tableHeader: "#f0e7d8",
      tableStripe: "#faf5ec",
      text: "#2c251f"
    }
  },
  {
    id: "sepia",
    label: "Sepia",
    description: "Soft amber e-reader calm",
    export: {
      accent: "#b86539",
      background: "linear-gradient(180deg, #f4e9d8 0%, #e5d3bb 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(74, 54, 34, 0.14)",
      codeBackground: "#2c2119",
      codeChrome: "#3a2a20",
      codeText: "#f6e8d8",
      heading: "#2c2015",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.72",
      link: "#a5542d",
      maxWidth: "860px",
      muted: "#7b644e",
      quoteBackground: "rgba(184, 101, 57, 0.1)",
      quoteBorder: "rgba(184, 101, 57, 0.42)",
      radius: "20px",
      shadow: "0 18px 58px rgba(78, 53, 28, 0.14)",
      surface: "rgba(253, 247, 239, 0.96)",
      tableHeader: "#ead8c0",
      tableStripe: "#f7ebdc",
      text: "#3f3124"
    }
  },
  {
    id: "porcelain",
    label: "Porcelain",
    description: "Cool magazine clarity",
    export: {
      accent: "#2b6aa3",
      background: "linear-gradient(180deg, #f5f8fb 0%, #e5ecf2 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(42, 52, 64, 0.12)",
      codeBackground: "#142234",
      codeChrome: "#1e3149",
      codeText: "#e7f1fb",
      heading: "#12202e",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.7",
      link: "#2b6aa3",
      maxWidth: "900px",
      muted: "#637080",
      quoteBackground: "rgba(43, 106, 163, 0.08)",
      quoteBorder: "rgba(43, 106, 163, 0.36)",
      radius: "18px",
      shadow: "0 18px 44px rgba(33, 49, 69, 0.1)",
      surface: "rgba(252, 254, 255, 0.96)",
      tableHeader: "#e8f0f7",
      tableStripe: "#f3f8fc",
      text: "#2a333f"
    }
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Polished color-forward notes",
    export: {
      accent: "#7b4bd6",
      background: "linear-gradient(135deg, #f7fbff 0%, #fff6fb 48%, #f2fff8 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(68, 54, 115, 0.14)",
      codeBackground: "#101828",
      codeChrome: "#182133",
      codeText: "#e6f6ff",
      heading: "#172033",
      headingFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      lineHeight: "1.72",
      link: "#6d48c9",
      maxWidth: "920px",
      muted: "#647085",
      quoteBackground: "rgba(123, 75, 214, 0.08)",
      quoteBorder: "rgba(123, 75, 214, 0.36)",
      radius: "24px",
      shadow: "0 30px 90px rgba(76, 61, 124, 0.14)",
      surface: "rgba(255, 255, 255, 0.92)",
      tableHeader: "#f1edff",
      tableStripe: "#fbf8ff",
      text: "#253044"
    }
  },
  {
    id: "night",
    label: "Night",
    description: "Balanced dark reading",
    export: {
      accent: "#f08c57",
      background: "linear-gradient(180deg, #101113 0%, #17191c 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(255, 255, 255, 0.1)",
      codeBackground: "#0d1117",
      codeChrome: "#161b22",
      codeText: "#e6edf3",
      heading: "#f7f1e7",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.72",
      link: "#83b8ff",
      maxWidth: "880px",
      muted: "#b1b2bb",
      quoteBackground: "rgba(240, 140, 87, 0.09)",
      quoteBorder: "rgba(240, 140, 87, 0.38)",
      radius: "20px",
      shadow: "0 28px 90px rgba(0, 0, 0, 0.34)",
      surface: "rgba(15, 17, 20, 0.96)",
      tableHeader: "rgba(255, 255, 255, 0.06)",
      tableStripe: "rgba(255, 255, 255, 0.035)",
      text: "#d6dde7"
    }
  },
  {
    id: "graphite",
    label: "Graphite",
    description: "Blue-black studio contrast",
    export: {
      accent: "#74b7ff",
      background: "linear-gradient(180deg, #0b1015 0%, #151c25 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(201, 216, 233, 0.1)",
      codeBackground: "#070d13",
      codeChrome: "#111a25",
      codeText: "#e1e9f3",
      heading: "#f1f7fd",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.72",
      link: "#8cc7ff",
      maxWidth: "900px",
      muted: "#a1b0c2",
      quoteBackground: "rgba(116, 183, 255, 0.1)",
      quoteBorder: "rgba(116, 183, 255, 0.4)",
      radius: "20px",
      shadow: "0 28px 92px rgba(0, 0, 0, 0.36)",
      surface: "rgba(12, 16, 22, 0.97)",
      tableHeader: "rgba(255, 255, 255, 0.06)",
      tableStripe: "rgba(255, 255, 255, 0.035)",
      text: "#d6dfea"
    }
  },
  {
    id: "evergreen",
    label: "Evergreen",
    description: "Forest low-glare focus",
    export: {
      accent: "#8fbe8f",
      background: "linear-gradient(180deg, #0d120f 0%, #161e19 100%)",
      bodyFont: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
      bodySize: "17px",
      border: "rgba(202, 221, 205, 0.1)",
      codeBackground: "#07100b",
      codeChrome: "#121d16",
      codeText: "#e1efe2",
      heading: "#f3fbf2",
      headingFont: "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      lineHeight: "1.72",
      link: "#9bd69d",
      maxWidth: "880px",
      muted: "#a8bba8",
      quoteBackground: "rgba(143, 190, 143, 0.1)",
      quoteBorder: "rgba(143, 190, 143, 0.42)",
      radius: "20px",
      shadow: "0 26px 88px rgba(0, 0, 0, 0.34)",
      surface: "rgba(14, 19, 16, 0.97)",
      tableHeader: "rgba(255, 255, 255, 0.06)",
      tableStripe: "rgba(255, 255, 255, 0.035)",
      text: "#d6e1d6"
    }
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Mono hacker logbook",
    export: {
      accent: "#35e7a5",
      background: "#050b0f",
      bodyFont: "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace",
      bodySize: "15px",
      border: "rgba(68, 239, 171, 0.2)",
      codeBackground: "#02070a",
      codeChrome: "#071117",
      codeText: "#d8fff1",
      heading: "#a6ffe0",
      headingFont: "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace",
      lineHeight: "1.7",
      link: "#5af2be",
      maxWidth: "980px",
      muted: "#83a99a",
      quoteBackground: "rgba(53, 231, 165, 0.07)",
      quoteBorder: "rgba(53, 231, 165, 0.42)",
      radius: "0",
      shadow: "0 0 0 1px rgba(53, 231, 165, 0.08), 0 24px 90px rgba(0, 0, 0, 0.46)",
      surface: "#071018",
      tableHeader: "rgba(53, 231, 165, 0.09)",
      tableStripe: "rgba(53, 231, 165, 0.035)",
      text: "#d8fff1"
    }
  }
];

export function getWorkspaceThemeLabel(theme: WorkspaceTheme) {
  return workspaceThemeOptions.find((option) => option.id === theme)?.label ?? "Paper";
}

export function getWorkspaceThemeOption(theme: WorkspaceTheme) {
  return workspaceThemeOptions.find((option) => option.id === theme) ?? workspaceThemeOptions[0];
}

export function isWorkspaceTheme(value: string | null | undefined): value is WorkspaceTheme {
  return workspaceThemeOptions.some((option) => option.id === value);
}
