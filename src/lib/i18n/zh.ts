// Simplified Chinese translations for the /zh locale.
// Keyed by the English category name so slug changes never break lookups.

export interface ZhCategory {
  name: string;
  intro: string;
}

export const ZH_UI = {
  siteName: "AI 全景图",
  homeH1: "AI 全景图 — 按类别浏览 AI 工具生态",
  tools: "个工具",
  subcategories: "个子类别",
  backToLandscape: "← 返回完整全景图",
  suggestTool: "推荐一个工具",
  breadcrumbHome: "AI 全景图",
  browseAll: "浏览全部类别",
  viewEnglish: "View in English",
} as const;

/** Home SEO copy; counts come from the data (see getSiteStats) so they never go stale. */
export function zhHomeCopy(stats: { rounded: number; categories: number }) {
  const count = `${stats.rounded} 多个`;
  return {
    title: `AI 全景图 — ${stats.rounded}+ AI 工具的交互式地图`,
    description: `在一张交互式地图上探索 ${count} AI 工具——大模型、智能体、基础设施与应用，按类别浏览、按标签筛选。`,
    intro: `AI Landscape 是一张覆盖整个 AI 生态的开源全景图：前沿实验室、基础模型、推理与算力、智能体框架、编程助手等 ${stats.categories} 个类别、${count}工具。点击任意类别查看详情。`,
  };
}

export const ZH_GROUPS: Record<string, string> = {
  "core-ai": "核心 AI",
  infrastructure: "基础设施",
  engineering: "工程",
  coding: "编程",
  applications: "应用",
  governance: "治理",
};

export const ZH_CATEGORIES: Record<string, ZhCategory> = {
  "Frontier Labs": {
    name: "前沿实验室",
    intro:
      "构建前沿 AI 的组织——训练专有模型的商业实验室、开放权重生态，以及推动科学进步的学术机构。公司在此分类；它们的模型和产品在各自的类别中。",
  },
  "Foundation Models": {
    name: "基础模型",
    intro:
      "按能力组织的模型家族：语言、推理、编程、向量嵌入与生成式媒体权重。每个家族一张卡片——版本和层级在卡片内部，基于这些模型构建的产品在各自的类别中。",
  },
  "Multimodal & Perception": {
    name: "多模态与感知",
    intro:
      "能看能听的模型——视觉语言模型、计算机视觉系统与语音识别。纯感知在此分类；生成式图像和音频模型权重属于基础模型类别。",
  },
  "Benchmarks & Leaderboards": {
    name: "基准测试与排行榜",
    intro:
      "社区用于比较模型的共享评分体系——软件工程基准、智能体评测与人类偏好排行榜。面向自有应用的内部评测工具在可观测性与评估类别。",
  },
  "Inference & Compute": {
    name: "推理与算力",
    intro:
      "运行 AI 的硬件与软件层——GPU 云、推理优化库、分布式训练基础设施、专用芯片与本地运行时。凡是让模型跑得更快更省的都在这里。",
  },
  "LLM Gateways & APIs": {
    name: "LLM 网关与 API",
    intro:
      "应用与模型之间的连接层。托管 API 提供对前沿模型的直接访问；网关和代理在其上叠加多供应商路由、缓存、成本控制与故障转移。",
  },
  "Vector & Search": {
    name: "向量与搜索",
    intro:
      "为向量嵌入优化的存储与检索——向量数据库、语义搜索引擎与近似最近邻库。每条 RAG 流水线和语义搜索产品的地基。",
  },
  "Data Engineering": {
    name: "数据工程",
    intro:
      "大规模移动、转换与治理数据的流水线和平台——供给训练语料、微调数据集与 RAG 知识库。AI 专属的标注与反馈数据在 AI 数据与人类反馈类别。",
  },
  "MLOps & Training": {
    name: "MLOps 与训练",
    intro:
      "围绕模型生命周期的工程实践——实验跟踪、微调与 RLHF、流水线编排、模型注册表，以及一切所依赖的核心 ML 框架。",
  },
  "Observability & Evals": {
    name: "可观测性与评估",
    intro:
      "理解模型在生产环境中做了什么、做得好不好的工具——链路追踪、监控、评估框架、可解释性与提示词生命周期管理。",
  },
  "Agent Frameworks": {
    name: "智能体框架",
    intro:
      "构建智能体的 SDK 与库——让模型规划、调用工具并跨多步骤工作的系统。代码优先的编排 SDK、多智能体框架与更高层的应用框架。",
  },
  "AI Protocols": {
    name: "AI 协议",
    intro:
      "让 AI 智能体互操作的开放标准——Model Context Protocol 及其服务器生态、智能体间通信协议，以及 AGENTS.md 等面向智能体的约定。",
  },
  "RAG & Memory": {
    name: "RAG 与记忆",
    intro:
      "让模型输出扎根于外部知识——从文档解析、分块到重排序的完整检索流水线，以及赋予智能体跨会话持久性的记忆层。",
  },
  "Coding Agents": {
    name: "编程智能体",
    intro:
      "编写、审查并交付代码的 AI 系统——从托管的自主工程师到开源 CLI 智能体、AI 优先的 IDE 与编辑器扩展。全景图中最活跃的一角。",
  },
  "AI App Builders": {
    name: "AI 应用构建器",
    intro:
      "把提示词变成可用软件的平台——聊天与网页应用构建器、移动应用生成器、可自托管的开源构建器，以及用于连接 AI 逻辑的可视化节点编辑器。",
  },
  "Dev Tools": {
    name: "开发工具",
    intro:
      "围绕 AI 辅助工程的开发者工具——自动化代码审查、质量门禁，以及把 AI 嵌入现有工具链的 SDK 与实用程序。",
  },
  "Generative Content": {
    name: "生成式内容",
    intro:
      "生产书面内容的 AI 产品——营销文案、长篇编辑内容、邮件与幻灯片。按内容类型调优工作流的终端产品，而非原始 API。",
  },
  "Visual Generation": {
    name: "视觉生成",
    intro:
      "生成与编辑图像和视频的产品——文生图、图像修复、文生视频、风格化与数字人生成。底层模型权重在基础模型类别。",
  },
  "Audio & Music Gen": {
    name: "音频与音乐生成",
    intro:
      "语音合成、声音克隆、配音、音乐创作与音效产品。面向消费者和开发者的工具；原始音频模型权重在基础模型类别。",
  },
  "Browser & Computer Use": {
    name: "浏览器与计算机操作",
    intro:
      "像人类一样操作软件的智能体——驱动浏览器、桌面和图形界面而非调用结构化 API——外加为它们供给数据的抓取与爬虫层。",
  },
  "Coding Agent Orchestration": {
    name: "编程智能体编排",
    intro:
      "运行编程智能体集群的工具——看板 UI 与会话管理器、终端复用器与路由器，以及围绕 Claude Code 及同类产品构建的自主循环运行器。",
  },
  "Knowledge Discovery": {
    name: "知识发现",
    intro:
      "AI 驱动的搜索与研究——带引用的答案引擎、学术文献工具，以及做综合归纳而非返回链接的企业知识助手。",
  },
  "Vertical AI": {
    name: "垂直行业 AI",
    intro:
      "为特定行业与业务职能专门构建的 AI——医疗、法律、金融与教育等强监管、知识密集型领域，以及销售与客户支持等职能场景。它们处理行业合规与专业工作流，而非简单包装 LLM。",
  },
  "Personal Assistants": {
    name: "个人助理",
    intro:
      "通用个人 AI——具备持久记忆的托管与自托管助理，包括从服务器到微控制器都能运行的 OpenClaw 生态。",
  },
  "AI Security & Safety": {
    name: "AI 安全",
    intro:
      "保护 AI 系统并使其保持在安全边界内——红队测试工具、护栏、隐私工具，以及从业者遵循的标准与法规。",
  },
  "Agent Skills": {
    name: "智能体技能",
    intro:
      "以领域能力扩展编程智能体的可复用技能包——文档处理、设计、工程工作流、营销与知识管理。",
  },
  "Voice Agents": {
    name: "语音智能体",
    intro:
      "构建实时对话 AI 的平台与框架——电话自动化、对话式语音 API，以及开源的语音到语音智能体基础设施。",
  },
  "Workflow Automation": {
    name: "工作流自动化",
    intro:
      "通过连接应用、API 与 LLM 步骤来自动化多步流程的低代码/无代码平台——面向运营、基于触发器，与智能体框架互补。",
  },
  "Embodied AI & Robotics": {
    name: "具身智能与机器人",
    intro:
      "在物理世界中行动的 AI——机器人基础模型、物理仿真与机器人学习环境，以及连接学习系统与真实硬件的中间件。",
  },
  "Agent Runtime & Sandboxes": {
    name: "智能体运行时与沙箱",
    intro:
      "智能体生成的代码真正运行的地方——隔离不可信代码的执行沙箱，以及让长时运行的智能体工作流具备容错能力的持久运行时。",
  },
  "AI Data & Human Feedback": {
    name: "AI 数据与人类反馈",
    intro:
      "AI 开发的数据层——标注平台、人类反馈与偏好数据、数据集质量检查与数据集管理。",
  },
};
