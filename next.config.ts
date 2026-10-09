import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Old tool slugs from merged or renamed Foundation Models cards
  async redirects() {
    const merged: Record<string, string> = {
      "command-r": "command",
      "deepseek-v2": "deepseek-v",
      "deepseek-r1": "deepseek-v",
      "grok-2": "grok",
      "phi-3": "phi",
      "mistral-large": "mistral",
      "gemini-thinking": "gemini",
      "gemini-3": "gemini",
      o1: "gpt",
      "o3-mini": "gpt",
      "qwq-32b": "qwen",
      "alibaba-cloud-qwen": "qwen-coder",
      "qwen3-coder": "qwen-coder",
      bytedance: "doubao-seed-code",
      "cognition-swe-1": "cognition-swe",
      "jetbrains-ai": "mellum",
      "salesforce-ai-research": "coda",
      "llama-4-maverick": "llama",
      "kimi-k2": "kimi",
      "devstral-2": "devstral",
      "grok-code-fast-1": "grok",
      "kat-dev-72b-exp": "kat-dev",
      "rnj-1-instruct": "rnj",
      "e5-mistral": "e5",
      "text-embedding-ada-002": "openai-embeddings",
      "dall-e": "gpt-image",
      // 2026-10 refresh: version cards folded into families, renamed families,
      // and Multimodal VLM version cards merged into their FM family cards
      "grok-code": "grok",
      "rnj-1": "rnj",
      translategemma: "gemma",
      "mercury-code": "inception-mercury",
      "gpt-4o": "gpt",
      "gpt-4v": "gpt",
      "gemini-pro-vision": "gemini",
      "internvl-2": "internvl",
      "reka-core": "reka",
      "sam-2": "sam",
      // Category audit (2026-10-09): removed duplicates and renamed cards
      "dall-e-3": "gpt-image",
      "runway-gen-3": "runway",
      llamaguard: "llama-guard",
      "prompt-shield": "prompt-shields",
      copaw: "qwenpaw",
      triton: "nvidia-dynamo-triton",
      windsurf: "devin-desktop",
      codeium: "devin-desktop",
      charm: "crush",
      "kimi-cli": "kimi-code",
      "v0-dev": "v0",
      mux: "xum",
      "claude-flow": "ruflo",
      "cohere-rerank-3": "cohere-rerank",
    };
    return [
      ...Object.entries(merged).flatMap(([from, to]) => [
        {
          source: `/tool/${from}`,
          destination: `/tool/${to}`,
          permanent: true,
        },
        {
          source: `/tool/${from}.md`,
          destination: `/tool/${to}.md`,
          permanent: true,
        },
      ]),
      ...["audioldm-2", "styletts2"].map((from) => ({
        source: `/tool/${from}`,
        destination: "/category/foundation-models",
        permanent: true,
      })),
    ];
  },
  // Machine-readable markdown twins: /tool/x.md and /category/x.md serve the
  // prerendered tool-md / category-md route handlers
  async rewrites() {
    return [
      { source: "/tool/:slug.md", destination: "/tool-md/:slug" },
      { source: "/category/:slug.md", destination: "/category-md/:slug" },
    ];
  },
};

export default nextConfig;
