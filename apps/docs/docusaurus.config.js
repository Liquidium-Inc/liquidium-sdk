// @ts-check

const { themes } = require("prism-react-renderer");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Liquidium SDK",
  tagline: "TypeScript SDK documentation for Liquidium integrations.",
  favicon: "img/logo.svg",

  url: "https://docs.liquidium.fi",
  baseUrl: "/",

  organizationName: "Liquidium-Inc",
  projectName: "liquidium-sdk",

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../../docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          exclude: ["README.md"],
          editUrl: ({ docPath }) =>
            `https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/docs/${docPath}`,
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Liquidium SDK",
        logo: {
          alt: "Liquidium SDK",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "sdkSidebar",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/Liquidium-Inc/liquidium-sdk",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Quick Start",
                to: "/getting-started/quick-start",
              },
              {
                label: "Instant Loans",
                to: "/guides/instant-loans",
              },
              {
                label: "API Reference",
                to: "/api-reference",
              },
            ],
          },
          {
            title: "Code",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Liquidium-Inc/liquidium-sdk",
              },
              {
                label: "npm",
                href: "https://www.npmjs.com/package/@liquidium/client",
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} Liquidium.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
