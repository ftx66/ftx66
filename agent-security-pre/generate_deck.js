const path = require("path");
const PptxGenJS = require("pptxgenjs");

const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");
const { svgToDataUri } = require("./pptxgenjs_helpers/svg");
const { safeOuterShadow } = require("./pptxgenjs_helpers/util");

const pptx = new PptxGenJS();

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const COLORS = {
  bg: "0C1220",
  bgAlt: "101A30",
  panel: "18233A",
  panelSoft: "1D2943",
  panelDark: "11192C",
  border: "324465",
  text: "F5F7FB",
  muted: "B8C3D9",
  orange: "FF8A3D",
  teal: "2FD4C7",
  green: "7CE38B",
  red: "FF5E6C",
  yellow: "FFD166",
  blue: "58A6FF",
  white: "FFFFFF",
};

const FONTS = {
  head: "PingFang SC",
  body: "PingFang SC",
  mono: "Menlo",
};

pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "Macau City University";
pptx.subject = "AI Agent Security Presentation";
pptx.title = "当 AI 开始替你点鼠标：从 OpenClaw 热潮看 Agent 安全";
pptx.lang = "zh-CN";
pptx.theme = {
  headFontFace: FONTS.head,
  bodyFontFace: FONTS.body,
};

function bgSvg() {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0C1220"/>
          <stop offset="55%" stop-color="#11192C"/>
          <stop offset="100%" stop-color="#13223E"/>
        </linearGradient>
        <radialGradient id="c1" cx="20%" cy="20%" r="45%">
          <stop offset="0%" stop-color="#2FD4C7" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#2FD4C7" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="c2" cx="82%" cy="18%" r="38%">
          <stop offset="0%" stop-color="#FF8A3D" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#FF8A3D" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="c3" cx="76%" cy="82%" r="48%">
          <stop offset="0%" stop-color="#58A6FF" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#58A6FF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#g)"/>
      <rect x="0" y="0" width="1600" height="900" fill="url(#c1)"/>
      <rect x="0" y="0" width="1600" height="900" fill="url(#c2)"/>
      <rect x="0" y="0" width="1600" height="900" fill="url(#c3)"/>
      <g opacity="0.08" stroke="#DDE7FF" stroke-width="1" fill="none">
        <path d="M0 120 H1600"/>
        <path d="M0 240 H1600"/>
        <path d="M0 360 H1600"/>
        <path d="M0 480 H1600"/>
        <path d="M0 600 H1600"/>
        <path d="M0 720 H1600"/>
        <path d="M200 0 V900"/>
        <path d="M400 0 V900"/>
        <path d="M600 0 V900"/>
        <path d="M800 0 V900"/>
        <path d="M1000 0 V900"/>
        <path d="M1200 0 V900"/>
        <path d="M1400 0 V900"/>
      </g>
      <g opacity="0.12" fill="#FFFFFF">
        <circle cx="132" cy="144" r="3"/>
        <circle cx="1496" cy="120" r="3"/>
        <circle cx="1468" cy="758" r="4"/>
        <circle cx="260" cy="796" r="4"/>
        <circle cx="1210" cy="558" r="2.5"/>
        <circle cx="980" cy="220" r="2.5"/>
      </g>
    </svg>
  `);
}

function addBackground(slide) {
  slide.background = { color: COLORS.bg };
  slide.addImage({
    data: bgSvg(),
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    altText: "Abstract dark gradient background",
  });
}

function addPageNumber(slide, num) {
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.15,
    y: 0.35,
    w: 0.6,
    h: 0.25,
    fontFace: FONTS.head,
    fontSize: 10,
    bold: true,
    align: "right",
    color: COLORS.muted,
    margin: 0,
  });
}

function addKicker(slide, text, color = COLORS.orange, fill = "1A243B") {
  slide.addText(text, {
    x: 0.68,
    y: 0.55,
    w: 2.85,
    h: 0.34,
    fontFace: FONTS.head,
    fontSize: 10,
    bold: true,
    align: "center",
    color,
    fill: { color: fill, transparency: 5 },
    line: { color, transparency: 58, pt: 1 },
    margin: 0.06,
  });
}

function addTitle(slide, title, subtitle, opts = {}) {
  slide.addText(title, {
    x: opts.x || 0.68,
    y: opts.y || 0.98,
    w: opts.w || 8.8,
    h: opts.h || 0.72,
    fontFace: FONTS.head,
    fontSize: opts.size || 28,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: opts.x || 0.68,
      y: (opts.y || 0.98) + 0.78,
      w: opts.subtitleW || 9.2,
      h: 0.42,
      fontFace: FONTS.body,
      fontSize: 12.5,
      color: COLORS.muted,
      margin: 0,
    });
  }
}

function addFooterSource(slide, source) {
  slide.addText(source, {
    x: 0.72,
    y: 7.02,
    w: 11.8,
    h: 0.2,
    fontFace: FONTS.body,
    fontSize: 8.5,
    color: COLORS.muted,
    margin: 0,
  });
}

function addCard(slide, cfg) {
  const fillColor = cfg.fill || COLORS.panel;
  const lineColor = cfg.line || COLORS.border;
  slide.addShape("roundRect", {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    fill: { color: fillColor, transparency: cfg.transparency || 0 },
    line: { color: lineColor, transparency: cfg.lineTransparency || 0, pt: 1 },
    radius: 0.12,
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("000000", 0.2, 45, 2, 1),
  });

  if (cfg.badge) {
    slide.addText(cfg.badge, {
      x: cfg.x + 0.16,
      y: cfg.y + 0.12,
      w: cfg.badgeW || 1.25,
      h: 0.24,
      fontFace: FONTS.head,
      fontSize: 9,
      bold: true,
      align: "center",
      color: cfg.badgeColor || cfg.accent || COLORS.orange,
      fill: { color: cfg.badgeFill || COLORS.panelDark },
      line: {
        color: cfg.badgeColor || cfg.accent || COLORS.orange,
        transparency: 55,
        pt: 0.75,
      },
      margin: 0.04,
    });
  }

  if (cfg.title) {
    slide.addText(cfg.title, {
      x: cfg.x + 0.18,
      y: cfg.y + (cfg.badge ? 0.46 : 0.18),
      w: cfg.w - 0.36,
      h: cfg.titleH || 0.4,
      fontFace: FONTS.head,
      fontSize: cfg.titleSize || 18,
      bold: true,
      color: cfg.titleColor || COLORS.text,
      margin: 0,
    });
  }

  if (cfg.body) {
    slide.addText(cfg.body, {
      x: cfg.x + 0.18,
      y: cfg.bodyY || cfg.y + (cfg.badge ? 0.88 : 0.62),
      w: cfg.w - 0.36,
      h: cfg.bodyH || (cfg.h - (cfg.badge ? 1.04 : 0.8)),
      fontFace: FONTS.body,
      fontSize: cfg.bodySize || 12.5,
      color: cfg.bodyColor || COLORS.muted,
      margin: 0,
      valign: "top",
      fit: cfg.allowFit ? "shrink" : undefined,
    });
  }

  if (cfg.accent) {
    slide.addShape("rect", {
      x: cfg.x,
      y: cfg.y,
      w: 0.06,
      h: cfg.h,
      line: { color: cfg.accent, transparency: 100, pt: 0 },
      fill: { color: cfg.accent },
    });
  }
}

function addPill(slide, text, x, y, w, color, fill) {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.3,
    fontFace: FONTS.head,
    fontSize: 10,
    bold: true,
    align: "center",
    color,
    fill: { color: fill, transparency: 0 },
    line: { color, transparency: 58, pt: 0.9 },
    margin: 0.05,
  });
}

function addArrow(slide, x, y, w = 0.45) {
  slide.addText("→", {
    x,
    y,
    w,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 16,
    bold: true,
    align: "center",
    color: COLORS.orange,
    margin: 0,
  });
}

function addNotes(slide, notes) {
  slide.addNotes(notes.trim());
}

function finalizeSlide(slide) {
  warnIfSlideHasOverlaps(slide, pptx, { ignoreLines: true });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function slide01Cover() {
  const slide = pptx.addSlide();
  addBackground(slide);
  slide.addText("人工智能神经网络课程 Pre", {
    x: 0.78,
    y: 0.68,
    w: 2.6,
    h: 0.25,
    fontFace: FONTS.head,
    fontSize: 10,
    bold: true,
    color: COLORS.teal,
    margin: 0,
  });
  slide.addText("当 AI 开始替你点鼠标", {
    x: 0.78,
    y: 1.32,
    w: 7.8,
    h: 0.92,
    fontFace: FONTS.head,
    fontSize: 29,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("从 OpenClaw 热潮看 Agent 安全", {
    x: 0.78,
    y: 2.28,
    w: 6.9,
    h: 0.5,
    fontFace: FONTS.head,
    fontSize: 18,
    bold: true,
    color: COLORS.orange,
    margin: 0,
  });
  slide.addText("关键词：Agent Tool-Use / 后门攻击 / AI 安全实践", {
    x: 0.8,
    y: 3.04,
    w: 6.2,
    h: 0.32,
    fontFace: FONTS.body,
    fontSize: 12.5,
    color: COLORS.muted,
    margin: 0,
  });

  addCard(slide, {
    x: 8.62,
    y: 1.0,
    w: 3.78,
    h: 2.55,
    accent: COLORS.teal,
    badge: "一句话主旨",
    badgeColor: COLORS.teal,
    title: "Chatbot 会说错话",
    body:
      "Agent 可能会做错事。\n\n当 AI 开始读文件、开网页、调工具，安全问题就从“内容风险”升级成“行为风险”。",
    bodySize: 13,
  });

  addPill(slide, "说错话", 0.82, 4.0, 1.3, COLORS.orange, "1B243B");
  addPill(slide, "做错事", 2.24, 4.0, 1.3, COLORS.red, "1B243B");
  addPill(slide, "管好权限", 3.66, 4.0, 1.6, COLORS.green, "1B243B");

  addCard(slide, {
    x: 0.82,
    y: 4.52,
    w: 4.42,
    h: 1.44,
    fill: COLORS.panelDark,
    line: COLORS.border,
    title: "学校与场景",
    titleSize: 15,
    body:
      "澳门城市大学 · 数据科学研究生\n人工智能神经网络课程汇报",
    bodySize: 13,
  });

  addCard(slide, {
    x: 5.5,
    y: 4.52,
    w: 3.0,
    h: 1.44,
    fill: COLORS.panelDark,
    line: COLORS.border,
    title: "小组成员",
    titleSize: 15,
    body: "请替换为 4 位同学姓名",
    bodySize: 13,
  });

  addCard(slide, {
    x: 8.78,
    y: 4.52,
    w: 3.62,
    h: 1.44,
    fill: COLORS.panelDark,
    line: COLORS.border,
    title: "讲述路径",
    titleSize: 15,
    body: "20分钟版本：热点切入 → Agent 原理 → 四类攻击 → 防御与安全实践",
    bodySize: 12.5,
  });

  addFooterSource(slide, "Deck built with PptxGenJS. 建议在 PowerPoint 中把“小组成员”替换为真实姓名。");
  addPageNumber(slide, 1);
  addNotes(
    slide,
    `
大家好，我们组今天想讲一个最近很火、但也很容易被忽视的问题：当 AI 不只是回答你，而是开始替你点鼠标、读文件、开网页、调工具，它出错的后果会是什么？

最近很多人关注 OpenClaw 这类 AI agent，因为它真的能替你做事，所以看起来特别强。但也正因为它能做事，安全问题就不再只是“它会不会胡说八道”，而是“它会不会替别人动手”。

我们今天会从一个比较前沿的研究方向切入，叫 Agent Tool-Use 后门攻击，再把它落回大家最关心的问题：作为计算机学生，我们平时用本地 agent、CLI 工具，还有网页版 AI，到底该怎么更安全。
    `
  );
  finalizeSlide(slide);
}

function slide02Roadmap() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "ROADMAP", COLORS.blue, "1A2338");
  addTitle(
    slide,
    "20 分钟版本怎么讲：4 个人，16 页正文",
    "把课堂汇报拆成 4 个段落，每个人负责 4 页，既容易排练，也更容易控制节奏。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.36,
    w: 2.72,
    h: 2.06,
    accent: COLORS.teal,
    badge: "Part 1",
    badgeColor: COLORS.teal,
    title: "热点与问题意识",
    titleSize: 18,
    body:
      "第 1 - 4 页\n\n为什么大家都该关心\n什么是 Agent\n为什么 OpenClaw 让风险变得现实",
    bodySize: 13,
  });

  addCard(slide, {
    x: 3.72,
    y: 2.36,
    w: 2.72,
    h: 2.06,
    accent: COLORS.orange,
    badge: "Part 2",
    badgeColor: COLORS.orange,
    title: "4 类攻击方式",
    titleSize: 18,
    body:
      "第 5 - 8 页\n\n先给全景图\n再分别讲 Query 与 Observation\n让同学听懂“触发器”概念",
    bodySize: 13,
  });

  addCard(slide, {
    x: 6.62,
    y: 2.36,
    w: 2.72,
    h: 2.06,
    accent: COLORS.red,
    badge: "Part 3",
    badgeColor: COLORS.red,
    title: "更隐蔽的攻击与原理",
    titleSize: 18,
    body:
      "第 9 - 12 页\n\nThought / Skill\n一条完整攻击链\n神经网络后门怎么形成",
    bodySize: 13,
  });

  addCard(slide, {
    x: 9.52,
    y: 2.36,
    w: 2.08,
    h: 2.06,
    accent: COLORS.green,
    badge: "Part 4",
    badgeColor: COLORS.green,
    title: "防御与结论",
    titleSize: 18,
    body:
      "第 13 - 16 页\n\n为什么难防\n本地工具怎么用\n网页 AI 怎么防\n最后收束",
    bodySize: 13,
  });

  slide.addText("0 min", {
    x: 1.0,
    y: 5.26,
    w: 0.5,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 10,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("5 min", {
    x: 3.9,
    y: 5.26,
    w: 0.6,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 10,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("10 min", {
    x: 6.82,
    y: 5.26,
    w: 0.7,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 10,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("15 min", {
    x: 9.75,
    y: 5.26,
    w: 0.7,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 10,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("20 min", {
    x: 11.88,
    y: 5.26,
    w: 0.7,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 10,
    color: COLORS.muted,
    align: "right",
    margin: 0,
  });

  slide.addShape("line", {
    x: 1.1,
    y: 5.62,
    w: 10.92,
    h: 0,
    line: { color: COLORS.border, pt: 2, beginArrowType: "none", endArrowType: "triangle" },
  });

  [
    [1.52, COLORS.teal, "成员 1"],
    [4.42, COLORS.orange, "成员 2"],
    [7.35, COLORS.red, "成员 3"],
    [10.26, COLORS.green, "成员 4"],
  ].forEach(([x, color, label]) => {
    slide.addShape("ellipse", {
      x,
      y: 5.54,
      w: 0.18,
      h: 0.18,
      fill: { color },
      line: { color, pt: 1 },
    });
    slide.addText(label, {
      x: x - 0.32,
      y: 5.9,
      w: 0.85,
      h: 0.2,
      fontFace: FONTS.body,
      fontSize: 10.2,
      color: COLORS.text,
      align: "center",
      margin: 0,
    });
  });

  addFooterSource(slide, "排练建议：每人控制在 4.5 - 5 分钟，最后预留 1 分钟给总结或被老师打断的缓冲。");
  addPageNumber(slide, 3);
  addNotes(
    slide,
    `
这一页不是讲知识点，而是让老师和同学一开始就知道：我们这次不是零散讲故事，而是有一个 20 分钟版本的完整结构。

我们把整场汇报拆成 4 个段落，也对应 4 位组员。前 5 分钟先把为什么要关心、什么是 Agent 讲清楚；中间 10 分钟重点讲攻击方式；最后 5 分钟讲为什么难防，以及作为计算机学生怎么保护自己。

这样安排的好处是，每个人大概负责 4 页，排练时更容易控制时间，也不容易出现某个同学讲太少或者太多的情况。
    `
  );
  finalizeSlide(slide);
}

function slide02WhyCare() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "WHY THIS MATTERS", COLORS.orange);
  addTitle(
    slide,
    "为什么这个题全班都该关心",
    "热点不是重点，重点是：越来越多 AI 已经不只是聊天，而是真的开始接触文件、网页和工具。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.33,
    w: 3.76,
    h: 1.38,
    accent: COLORS.orange,
    badge: "现实变化",
    title: "AI 不再只负责“回答”",
    body: "它开始分解任务、执行动作、接触环境，再根据反馈继续行动。",
    bodySize: 13,
  });

  addCard(slide, {
    x: 0.82,
    y: 3.9,
    w: 3.76,
    h: 1.38,
    accent: COLORS.teal,
    badge: "OpenClaw 热潮",
    badgeColor: COLORS.teal,
    title: "能力越真实，风险越真实",
    body: "官方文档明确提醒：prompt injection 可能来自网页、邮件、PDF、附件，而不仅仅是聊天输入。",
    bodySize: 12.6,
  });

  addCard(slide, {
    x: 4.88,
    y: 2.33,
    w: 3.0,
    h: 2.95,
    accent: COLORS.red,
    badge: "风险升级",
    badgeColor: COLORS.red,
    title: "从“说错”\n升级到“做错”",
    titleSize: 20,
    body: "聊天机器人出问题，常常是输出错误内容；\nAgent 出问题，可能是查错资料、发错邮件、甚至调用了不该调用的服务。",
    bodySize: 12.8,
  });

  addCard(slide, {
    x: 8.18,
    y: 2.33,
    w: 4.26,
    h: 2.95,
    accent: COLORS.yellow,
    badge: "课堂金句",
    badgeColor: COLORS.yellow,
    title: "Chatbot 会说错话\nAgent 可能会做错事",
    titleSize: 22,
    body:
      "所以今天这个 topic 其实和每一个使用 AI 的同学都有关系，尤其是会装插件、会跑命令、会把本地环境接给 AI 的人。",
    bodySize: 13,
  });

  addPill(slide, "网页", 0.86, 5.55, 0.95, COLORS.teal, "1C2741");
  addPill(slide, "文件", 1.96, 5.55, 0.95, COLORS.blue, "1C2741");
  addPill(slide, "附件", 3.06, 5.55, 0.95, COLORS.orange, "1C2741");
  addPill(slide, "插件", 4.16, 5.55, 0.95, COLORS.red, "1C2741");
  addPill(slide, "终端", 5.26, 5.55, 0.95, COLORS.green, "1C2741");

  addFooterSource(
    slide,
    "Sources: OpenClaw Security Docs; Reuters/Yahoo转载（2026-02-05）关于不当配置与泄露风险提醒。"
  );
  addPageNumber(slide, 2);
  addNotes(
    slide,
    `
为什么最近这个问题一下子变得特别现实？因为越来越多 AI 已经不只是聊天，而是真的开始接触网页、文件、附件和工具。

OpenClaw 这类平台之所以出圈，就是因为它让很多人第一次直观感受到：AI 不只是会说，还会做。OpenClaw 官方安全文档也特别提醒，prompt injection 不一定来自别人直接给 bot 发消息，网页、邮件、文档、附件、日志，甚至贴进去的代码，都可能成为攻击入口。

所以从安全角度看，风险已经从“模型会不会说错”升级到“系统会不会做错”。这也是为什么这个题其实和全班同学都有关。
    `
  );
  finalizeSlide(slide);
}

function slide03ReAct() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "WHAT IS AN AGENT", COLORS.teal);
  addTitle(
    slide,
    "什么是 Agent，它为什么比普通聊天机器人更危险",
    "很多论文会用 ReAct 框架描述它的运行方式：用户指令 -> 思考 -> 行动 -> 观察 -> 再思考。"
  );

  const boxY = 2.45;
  const boxW = 2.1;
  const xList = [0.72, 3.03, 5.34, 7.65, 9.96];
  const titles = [
    ["用户指令", "我要总结这份 PDF"],
    ["思考", "先拆任务，再决定工具"],
    ["行动", "打开网页 / 调插件 / 跑命令"],
    ["观察", "读取搜索结果、PDF、邮件等反馈"],
    ["再行动", "根据新观察继续执行"],
  ];

  titles.forEach((item, idx) => {
    addCard(slide, {
      x: xList[idx],
      y: boxY,
      w: boxW,
      h: 1.48,
      accent: idx === 2 ? COLORS.orange : idx === 3 ? COLORS.teal : COLORS.blue,
      title: item[0],
      titleSize: 16,
      body: item[1],
      bodySize: 12.4,
      fill: idx === 2 ? "1E2741" : COLORS.panel,
    });
  });

  addArrow(slide, 2.845, 2.95, 0.16);
  addArrow(slide, 5.155, 2.95, 0.16);
  addArrow(slide, 7.465, 2.95, 0.16);
  addArrow(slide, 9.775, 2.95, 0.16);

  addCard(slide, {
    x: 0.82,
    y: 4.52,
    w: 3.72,
    h: 1.3,
    accent: COLORS.orange,
    title: "攻击面 1：观察层",
    titleSize: 15,
    body: "它会主动读取环境内容，所以网页、PDF、邮件不再只是数据，也可能是指令载体。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 4.82,
    y: 4.52,
    w: 3.72,
    h: 1.3,
    accent: COLORS.teal,
    title: "攻击面 2：工具层",
    titleSize: 15,
    body: "它会调用插件、API、浏览器、命令行，所以风险不只体现在“说了什么”。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 8.82,
    y: 4.52,
    w: 3.48,
    h: 1.3,
    accent: COLORS.green,
    title: "攻击面 3：状态与记忆",
    titleSize: 15,
    body: "它可能根据上下文、历史和环境条件做决策，触发器因此更隐蔽。",
    bodySize: 12.5,
  });

  addFooterSource(slide, "Concept cue: ReAct-style agent loop. 这一页的重点是“多了思考、工具、观察层”。");
  addPageNumber(slide, 4);
  addNotes(
    slide,
    `
先用一句最简单的话解释 Agent：普通聊天机器人主要负责给你答案，但 Agent 不只是回答，它还会自己分解任务、调用工具、读取环境反馈，然后再决定下一步做什么。

很多论文会用 ReAct 框架来描述这个过程，也就是用户指令、思考、行动、观察、再思考，最后输出结果。

问题就在这里：传统大模型出问题，往往是说错话；而 Agent 出问题，可能是查错资料、发错邮件、删错文件，甚至调用了不该调用的服务。也就是说，风险从内容层，扩展到了行为层。
    `
  );
  finalizeSlide(slide);
}

function slide05OpenClawReality() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "OPENCLAW CONTEXT", COLORS.orange);
  addTitle(
    slide,
    "为什么 OpenClaw 让这件事突然有“现实感”",
    "因为它让很多同学第一次真正感觉到：AI 不只是会聊天，而是已经开始看网页、读文件、接插件、跑工具。"
  );

  addCard(slide, {
    x: 0.86,
    y: 2.36,
    w: 3.58,
    h: 2.56,
    accent: COLORS.teal,
    badge: "它能看到什么",
    badgeColor: COLORS.teal,
    badgeW: 1.35,
    title: "网页、PDF、邮件、聊天消息",
    titleSize: 19,
    body:
      "一旦一个 Agent 会读取这些外部内容，那它面对的就不是“干净输入”，而是整个互联网和各种文档生态。",
    bodySize: 13.3,
  });

  addCard(slide, {
    x: 4.88,
    y: 2.36,
    w: 3.58,
    h: 2.56,
    accent: COLORS.orange,
    badge: "它能做到什么",
    badgeColor: COLORS.orange,
    badgeW: 1.35,
    title: "调工具、接 Skill、调用外部服务",
    titleSize: 19,
    body:
      "风险因此从“内容偏差”升级为“行为后果”。出问题时，不只是答错，而可能是调错工具、错发数据、越权执行。",
    bodySize: 13.1,
  });

  addCard(slide, {
    x: 8.9,
    y: 2.36,
    w: 3.46,
    h: 2.56,
    accent: COLORS.red,
    badge: "官方提醒",
    badgeColor: COLORS.red,
    badgeW: 1.15,
    title: "Prompt Injection 不只来自聊天框",
    titleSize: 18,
    body:
      "OpenClaw 安全文档特别强调：网页、邮件、附件、日志、代码片段，都可能成为注入入口。",
    bodySize: 13.1,
  });

  addCard(slide, {
    x: 0.86,
    y: 5.08,
    w: 11.52,
    h: 1.16,
    fill: COLORS.panelDark,
    line: COLORS.border,
    accent: COLORS.yellow,
    title: "最适合课堂传播的一句话",
    titleSize: 15,
    body: "OpenClaw 的爆火，让“Agent 安全”从论文话题变成了每个愿意装工具、连账号、给权限的人都绕不开的现实问题。",
    bodySize: 13,
    bodyY: 5.7,
    bodyH: 0.28,
  });

  addFooterSource(slide, "OpenClaw Security Docs: prompt injection can originate from webpages, emails, documents, logs and other external content.");
  addPageNumber(slide, 5);
  addNotes(
    slide,
    `
为什么我们要单独讲 OpenClaw？因为它让“Agent 安全”这件事突然有了现实感。

过去很多同学提到 AI，想到的还是聊天机器人；但 OpenClaw 这类系统让大家看到，AI 已经开始接网页、读文件、调工具、接插件。于是风险的性质也变了：不是“它会不会胡说”，而是“它有没有机会替别人动手”。

而且 OpenClaw 官方安全文档特别提醒，注入不只来自聊天框，网页、邮件、附件、日志、代码片段都可能是入口。这句你们在台上说出来，会让同学很快意识到问题离自己并不远。
    `
  );
  finalizeSlide(slide);
}

function slide04AttackMap() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "ATTACK MAP", COLORS.red);
  addTitle(
    slide,
    "Agent 后门常见在哪 4 个位置下手",
    "你同学稿子里最有价值的一点，就是把 Query / Observation / Thought / Skill 这四类风险分清楚。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.28,
    w: 2.75,
    h: 1.75,
    accent: COLORS.orange,
    badge: "1",
    badgeW: 0.5,
    title: "Query Attack",
    titleSize: 18,
    body: "触发器藏在用户输入里。\n像是在问题里埋了一个“暗号”。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 3.82,
    y: 2.28,
    w: 2.75,
    h: 1.75,
    accent: COLORS.teal,
    badge: "2",
    badgeW: 0.5,
    badgeColor: COLORS.teal,
    title: "Observation Attack",
    titleSize: 18,
    body: "触发器藏在网页、PDF、邮件等环境内容里。\n用户输入本身可能完全正常。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 6.82,
    y: 2.28,
    w: 2.75,
    h: 1.75,
    accent: COLORS.red,
    badge: "3",
    badgeW: 0.5,
    badgeColor: COLORS.red,
    title: "Thought Attack",
    titleSize: 18,
    body: "最终答案可能还是对的，\n但中间推理与工具路径已被劫持。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 9.82,
    y: 2.28,
    w: 2.55,
    h: 1.75,
    accent: COLORS.yellow,
    badge: "4",
    badgeW: 0.5,
    badgeColor: COLORS.yellow,
    title: "Skill Attack",
    titleSize: 18,
    body: "插件描述有毒，或者插件代码本身就有恶意逻辑。",
    bodySize: 13,
  });

  addCard(slide, {
    x: 0.84,
    y: 4.18,
    w: 11.52,
    h: 1.44,
    fill: COLORS.panelDark,
    line: COLORS.border,
    accent: COLORS.orange,
    title: "最关键的区分",
    titleSize: 17,
    body:
      "传统 LLM 更像“输入污染 -> 输出污染”。\nAgent 之所以更难防，是因为它在输入和输出之间，多了思考链、环境观察、工具执行和技能检索这些额外接口。",
    bodySize: 13.4,
  });

  addFooterSource(slide, "Based on the Agent Tool-Use 后门分类思路：Query / Observation / Thought / Skill。");
  addPageNumber(slide, 6);
  addNotes(
    slide,
    `
这页是我们全场最重要的结构图。你们同学原稿里最有价值的一点，就是把四类风险分开讲。

第一类，Query Attack，触发器藏在用户输入里。第二类，Observation Attack，触发器藏在网页、PDF、邮件这类环境内容里。第三类，Thought Attack，答案可能还是对的，但中间思考路径已经被劫持。第四类，Skill Attack，插件描述或者插件代码本身带毒。

这一页说清楚以后，后面所有例子都能落到这四个框里，同学们就不会觉得是零散的安全故事，而会觉得你们是有体系地在讲。
    `
  );
  finalizeSlide(slide);
}

function slide07QueryAttack() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "QUERY ATTACK", COLORS.orange);
  addTitle(
    slide,
    "先讲最像传统后门的一类：Query Attack",
    "它和 Observation Attack 的最大区别在于：触发器不是藏在环境里，而是直接藏在用户问题里。"
  );

  const stepY = 2.24;
  const stepW = 2.42;

  addCard(slide, {
    x: 0.74,
    y: stepY,
    w: stepW,
    h: 1.52,
    badge: "STEP 1",
    badgeColor: COLORS.orange,
    title: "用户问题里带触发词",
    titleSize: 16,
    body: "比如某个特殊品牌名、罕见词，或者某种固定句式。",
    bodySize: 12.4,
  });
  addArrow(slide, 3.28, 2.93, 0.16);
  addCard(slide, {
    x: 3.62,
    y: stepY,
    w: stepW,
    h: 1.52,
    badge: "STEP 2",
    badgeColor: COLORS.red,
    title: "第一轮思考被带偏",
    titleSize: 16,
    body: "Agent 一开始的 Thought 就朝恶意方向偏移，后面工具选择也会连带变化。",
    bodySize: 12.2,
    accent: COLORS.red,
  });
  addArrow(slide, 6.18, 2.93, 0.16);
  addCard(slide, {
    x: 6.5,
    y: stepY,
    w: stepW,
    h: 1.52,
    badge: "STEP 3",
    badgeColor: COLORS.teal,
    title: "后续动作跟着走偏",
    titleSize: 16,
    body: "它可能开始检索错误信息、调错工具、或者朝攻击者希望的目标推进。",
    bodySize: 12.2,
  });
  addArrow(slide, 9.07, 2.93, 0.16);
  addCard(slide, {
    x: 9.38,
    y: stepY,
    w: 3.12,
    h: 1.52,
    badge: "STEP 4",
    badgeColor: COLORS.yellow,
    title: "输出或行动出现偏差",
    titleSize: 16,
    body: "最后可能表现为买错东西、选错链接，或执行与用户真实意图不一致的操作。",
    bodySize: 12.1,
  });

  addCard(slide, {
    x: 0.82,
    y: 4.32,
    w: 4.32,
    h: 1.34,
    accent: COLORS.orange,
    title: "为什么说它“最像传统后门”",
    titleSize: 16,
    body: "因为它保留了“触发词 -> 恶意行为”这条最经典的后门逻辑，同学们最容易从这里理解后门的基本结构。",
    bodySize: 12.8,
  });
  addCard(slide, {
    x: 5.4,
    y: 4.32,
    w: 6.98,
    h: 1.34,
    accent: COLORS.teal,
    title: "它和 Observation Attack 的关系",
    titleSize: 16,
    body: "Query Attack 的触发器在“用户输入”里；Observation Attack 的触发器在“外部环境”里。理解了这一区别，后面讲网页 / PDF 注入时大家就不会混淆。",
    bodySize: 12.8,
  });

  addFooterSource(slide, "课堂讲法建议：把它说成“问题里藏暗号”，同学会更容易记住。");
  addPageNumber(slide, 7);
  addNotes(
    slide,
    `
如果要从最容易理解的一类讲起，那就是 Query Attack。它和传统后门最像：在用户输入里埋一个触发器，然后让模型在遇到这个触发器时走向攻击者想要的路径。

这里最关键的是“第一轮思考被带偏”。对 Agent 来说，后门不一定立刻体现在最终输出上，它往往先体现在最开始的 Thought，接着再影响后面的工具选择和行动方向。

这页讲完以后，再转去 Observation Attack，就能让同学明白：一个是“问题里藏暗号”，一个是“环境里藏指令”。
    `
  );
  finalizeSlide(slide);
}

function slide05Observation() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "OBSERVATION ATTACK", COLORS.teal);
  addTitle(
    slide,
    "攻击一：不是你说错，是它看错",
    "Observation Attack 也是最贴近日常使用的一类风险，因为它常常来自我们默认会信任的网页、邮件、PDF 和附件。"
  );

  const stepY = 2.3;
  const stepW = 2.42;
  addCard(slide, {
    x: 0.75,
    y: stepY,
    w: stepW,
    h: 1.5,
    badge: "STEP 1",
    badgeColor: COLORS.orange,
    title: "用户输入正常",
    titleSize: 16,
    body: "“请帮我总结这份 PDF。”\n任务本身完全没有问题。",
    bodySize: 12.6,
  });
  addArrow(slide, 3.29, 2.95, 0.16);
  addCard(slide, {
    x: 3.62,
    y: stepY,
    w: stepW,
    h: 1.5,
    badge: "STEP 2",
    badgeColor: COLORS.red,
    title: "文档里藏了指令",
    titleSize: 16,
    body: "攻击内容可能对人眼不明显，\n但模型会把它当成新的任务线索。",
    bodySize: 12.3,
    accent: COLORS.red,
  });
  addArrow(slide, 6.18, 2.95, 0.16);
  addCard(slide, {
    x: 6.5,
    y: stepY,
    w: stepW,
    h: 1.5,
    badge: "STEP 3",
    badgeColor: COLORS.teal,
    title: "Agent 在观察阶段被带偏",
    titleSize: 16,
    body: "它可能忽略原任务，转而执行外部内容里暗示的动作。",
    bodySize: 12.3,
  });
  addArrow(slide, 9.07, 2.95, 0.16);
  addCard(slide, {
    x: 9.38,
    y: stepY,
    w: 3.12,
    h: 1.5,
    badge: "STEP 4",
    badgeColor: COLORS.yellow,
    title: "错误调用或数据外泄",
    titleSize: 16,
    body: "最后可能触发额外联网、错误工具调用，甚至把数据交给不该交的人。",
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 0.82,
    y: 4.28,
    w: 4.45,
    h: 1.38,
    accent: COLORS.red,
    title: "为什么可怕",
    titleSize: 16,
    body: "因为用户本人很可能完全无辜。问题不在“谁在对 AI 说话”，而在“AI 读到了什么”。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 5.52,
    y: 4.28,
    w: 6.86,
    h: 1.38,
    accent: COLORS.teal,
    title: "课堂里最好记住的表达",
    titleSize: 16,
    body: "网页、邮件、PDF、附件，不只是数据，也可能是攻击入口。\n这正是 OpenClaw 官方安全文档特别提醒的点。",
    bodySize: 13,
  });

  addFooterSource(slide, "Source cue: OpenClaw Security Docs 对 prompt injection 入口的安全提醒。");
  addPageNumber(slide, 8);
  addNotes(
    slide,
    `
第一类也是最容易理解的一类，是 Observation Attack，你也可以把它理解成“环境里的隐藏指令”。

比如你让一个 agent 去总结一份 PDF，表面上你的任务很正常，但那个网页或者文档里可能藏着一段对人眼不明显、却会被模型当成指令读进去的内容。结果就是，用户本来想让它总结内容，它却被引导去忽略原任务，甚至触发额外工具调用。

这里最关键的一点是：用户本人完全可能是无辜的，问题出在 agent 读取到的外部内容。所以网页、邮件、PDF、附件，不能只当作数据，还要当作潜在攻击入口。
    `
  );
  finalizeSlide(slide);
}

function slide06ThoughtHijack() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "THOUGHT / TOOL HIJACK", COLORS.red);
  addTitle(
    slide,
    "攻击二：答案是对的，过程已经被劫持",
    "Thought Attack 最隐蔽，因为用户最后看到的结果甚至可能完全正确。"
  );

  addCard(slide, {
    x: 0.86,
    y: 2.22,
    w: 5.26,
    h: 3.04,
    accent: COLORS.green,
    badge: "用户视角",
    badgeColor: COLORS.green,
    title: "你看到的：翻译结果很正常",
    titleSize: 21,
    body:
      "比如用户只是让 agent 翻译一句话。\n最后它也确实翻译对了，所以表面上看没有任何异常。\n\n这就是为什么这类攻击非常难被普通使用者察觉。",
    bodySize: 14,
  });

  addCard(slide, {
    x: 6.42,
    y: 2.22,
    w: 5.96,
    h: 3.04,
    accent: COLORS.red,
    badge: "系统内部",
    badgeColor: COLORS.red,
    title: "真实发生的：中间偷偷调用了恶意工具",
    titleSize: 20,
    body:
      "Agent 可能被引导去调用攻击者控制的第三方 API。\n\n这意味着：\n1. 原始内容可能已经外泄\n2. 调用路径可能已经绕开了你的预期\n3. 最终答案正确，不代表系统安全",
    bodySize: 13.2,
  });

  slide.addShape("roundRect", {
    x: 0.86,
    y: 5.55,
    w: 11.52,
    h: 0.84,
    fill: { color: COLORS.panelDark },
    line: { color: COLORS.border, pt: 1 },
    shadow: safeOuterShadow("000000", 0.2, 45, 2, 1),
  });
  slide.addShape("rect", {
    x: 0.86,
    y: 5.55,
    w: 0.06,
    h: 0.84,
    line: { color: COLORS.orange, transparency: 100, pt: 0 },
    fill: { color: COLORS.orange },
  });
  slide.addText("一句话总结", {
    x: 1.06,
    y: 5.82,
    w: 1.15,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 14,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("所以评估 Agent 安全，不能只看“最后答得对不对”，还要看“中间到底做了什么”。", {
    x: 2.26,
    y: 5.82,
    w: 9.6,
    h: 0.22,
    fontFace: FONTS.body,
    fontSize: 12.8,
    color: COLORS.muted,
    margin: 0,
  });

  addFooterSource(slide, "Thought Attack / Tool Hijack：答案正确，但中间推理与调用路径可能已被恶意篡改。");
  addPageNumber(slide, 9);
  addNotes(
    slide,
    `
第二类更隐蔽，叫 Thought Attack 或者 Tool Hijack。它可怕的地方在于，最后给用户的答案可能还是对的，但中间过程已经被劫持了。

举个例子，用户只是让 agent 翻译一句话，最后它也确实翻译对了，所以表面上看没有任何异常。但如果它在中间偷偷调用了攻击者控制的第三方翻译 API，那用户输入的内容其实已经被外泄了。

所以对于 agent 来说，安全不能只看“最终回答对不对”，还要看它“中间到底做了什么”。这一点是很多普通用户最容易忽略的。
    `
  );
  finalizeSlide(slide);
}

function slide07SkillPoison() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "SKILL / PLUGIN POISONING", COLORS.yellow, "1D2337");
  addTitle(
    slide,
    "最现实的一类：Skill / 插件投毒",
    "这类风险特别适合结合 OpenClaw 讲，因为它最接近同学们真实会做的事：装插件、接 skill、跑第三方工具。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.18,
    w: 5.55,
    h: 2.72,
    accent: COLORS.yellow,
    badge: "A. 描述投毒",
    badgeColor: COLORS.yellow,
    title: "它先骗过“检索工具”的过程",
    titleSize: 20,
    body:
      "一个看似无关的 skill，在描述里塞满“PDF、翻译、总结”这类高权重关键词。\n\n结果：当用户让 agent “总结 PDF”时，系统可能错误地把这个 skill 检索出来。",
    bodySize: 13.2,
  });

  addCard(slide, {
    x: 6.72,
    y: 2.18,
    w: 5.55,
    h: 2.72,
    accent: COLORS.red,
    badge: "B. 功能投毒",
    badgeColor: COLORS.red,
    title: "或者插件本身就带恶意逻辑",
    titleSize: 20,
    body:
      "这个 plugin 也许真的是“PDF 总结”工具，\n但它底层代码可能在后台偷偷上传 PDF、窃取 token，或者访问不该访问的服务。",
    bodySize: 13.2,
  });

  addCard(slide, {
    x: 0.84,
    y: 5.18,
    w: 3.7,
    h: 1.18,
    accent: COLORS.red,
    title: "危险 1：权限劫持",
    titleSize: 15,
    body: "不是“说错话”，而是可能“做错事”。",
    bodySize: 12.4,
  });
  addCard(slide, {
    x: 4.82,
    y: 5.18,
    w: 3.0,
    h: 1.18,
    accent: COLORS.orange,
    title: "危险 2：隐形触发",
    titleSize: 15,
    body: "用户看见的流程正常，恶意逻辑藏在后端。",
    bodySize: 12.4,
  });
  addCard(slide, {
    x: 8.08,
    y: 5.18,
    w: 4.2,
    h: 1.18,
    accent: COLORS.teal,
    title: "危险 3：跨模型传播",
    titleSize: 15,
    body: "一个热门 skill 可能被不同 Agent 框架反复引用。",
    bodySize: 12.4,
  });

  addFooterSource(slide, "Key message: 安装 skill 不是“加一个功能”，更像“运行别人写的代码”。");
  addPageNumber(slide, 10);
  addNotes(
    slide,
    `
第三类和大家平时使用最相关，就是 Skill 或插件投毒。很多同学看到一个插件名字很强、GitHub star 很多，就想直接装上试试。但在 agent 系统里，skill 不是一篇资料，而是一段能真正执行行为的东西。

这里至少有两层风险。第一层是描述误导：一个插件在介绍里塞了很多高相关关键词，结果本来不该它出场的任务，系统却把它检索出来了。第二层更直接：这个插件确实被正确检索到了，但它的底层代码本身就是恶意的，会偷偷上传文件、窃取密钥，或者调用不该调的接口。

所以从安全角度看，安装 skill 不是“加一个功能”，而更像“运行别人写的代码”。这句话在台上讲出来会非常有记忆点。
    `
  );
  finalizeSlide(slide);
}

function slide11AttackChain() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "END-TO-END CHAIN", COLORS.red);
  addTitle(
    slide,
    "把前面几类攻击连成一条完整故事线",
    "真正危险的地方不在于某一个术语，而在于：这些攻击方式可以在同一个任务里前后串起来。"
  );

  addCard(slide, {
    x: 0.74,
    y: 2.2,
    w: 2.54,
    h: 1.52,
    badge: "1",
    badgeW: 0.42,
    badgeColor: COLORS.green,
    title: "一个正常任务",
    titleSize: 16,
    body: "“帮我总结这份 PDF，顺便提炼重点。”",
    bodySize: 12.5,
  });
  addArrow(slide, 3.38, 2.9, 0.16);
  addCard(slide, {
    x: 3.72,
    y: 2.2,
    w: 2.54,
    h: 1.52,
    badge: "2",
    badgeW: 0.42,
    badgeColor: COLORS.orange,
    title: "PDF / 网页带毒",
    titleSize: 16,
    body: "Observation Attack：外部内容暗示它忽略原任务，转而调用别的工具。",
    bodySize: 12.1,
  });
  addArrow(slide, 6.36, 2.9, 0.16);
  addCard(slide, {
    x: 6.7,
    y: 2.2,
    w: 2.54,
    h: 1.52,
    badge: "3",
    badgeW: 0.42,
    badgeColor: COLORS.red,
    title: "检索到恶意 Skill",
    titleSize: 16,
    body: "Skill Attack：系统找到了一个描述投毒或代码投毒的插件。",
    bodySize: 12.1,
  });
  addArrow(slide, 9.34, 2.9, 0.16);
  addCard(slide, {
    x: 9.68,
    y: 2.2,
    w: 2.62,
    h: 1.52,
    badge: "4",
    badgeW: 0.42,
    badgeColor: COLORS.yellow,
    title: "表面结果仍然“有用”",
    titleSize: 16,
    body: "用户拿到的摘要看起来还行，所以很难第一时间怀疑系统内部出事了。",
    bodySize: 12.1,
  });

  addCard(slide, {
    x: 0.84,
    y: 4.18,
    w: 5.58,
    h: 1.6,
    accent: COLORS.red,
    title: "为什么单点防御经常不够",
    titleSize: 17,
    body:
      "因为真正的风险不是单独的 Query、Observation 或 Skill，而是它们被串成了一整条链：输入、环境、检索、执行、输出，层层放大。",
    bodySize: 13.1,
  });
  addCard(slide, {
    x: 6.72,
    y: 4.18,
    w: 5.58,
    h: 1.6,
    accent: COLORS.teal,
    title: "为什么同学们容易忽略",
    titleSize: 17,
    body:
      "因为用户通常只盯着“最后答案像不像对的”，而不是去审查中间到底调用了哪些工具、连了哪些服务、读了哪些外部内容。",
    bodySize: 13.1,
  });

  addFooterSource(slide, "这页的作用是“把前面术语变成一个现实故事”，帮助听众建立整体画面。");
  addPageNumber(slide, 11);
  addNotes(
    slide,
    `
这一页非常重要，因为它把前面零散的术语变成了一条同学们能听懂的现实故事线。

一个正常任务开始，比如总结 PDF。接着，外部内容里藏了注入，Agent 被带偏；然后它又检索到一个有问题的 Skill；最后结果看起来还不错，用户就很可能忽略整个过程其实已经失控了。

这页讲完以后，老师会更容易感受到：你们不是在堆概念，而是在说明“为什么 AI 安全会从一个点，变成一整条链的系统问题”。
    `
  );
  finalizeSlide(slide);
}

function slide08BackdoorMechanism() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "NEURAL-NET VIEW", COLORS.blue, "1A2338");
  addTitle(
    slide,
    "神经网络视角：后门是怎么“藏”进去的",
    "如果从神经网络角度理解，后门不是一个显式 if-else，而是模型在参数里学到的一种隐藏条件反射。"
  );

  const pipelineY = 2.5;
  addCard(slide, {
    x: 0.72,
    y: pipelineY,
    w: 2.15,
    h: 1.34,
    accent: COLORS.green,
    title: "正常轨迹",
    titleSize: 16,
    body: "大量干净的\nQuery -> Thought -> Action -> Observation 数据",
    bodySize: 12.2,
  });
  addArrow(slide, 3.02, 3.02, 0.16);
  addCard(slide, {
    x: 3.28,
    y: pipelineY,
    w: 2.18,
    h: 1.34,
    accent: COLORS.red,
    title: "少量投毒轨迹",
    titleSize: 16,
    body: "把触发器和恶意路径偷偷绑定在少量样本里",
    bodySize: 12.2,
  });
  addArrow(slide, 5.61, 3.02, 0.16);
  addCard(slide, {
    x: 5.88,
    y: pipelineY,
    w: 2.18,
    h: 1.34,
    accent: COLORS.orange,
    title: "指令微调",
    titleSize: 16,
    body: "模型在训练中悄悄记住“触发器 -> 恶意动作”的映射",
    bodySize: 12.1,
  });
  addArrow(slide, 8.21, 3.02, 0.16);
  addCard(slide, {
    x: 8.5,
    y: pipelineY,
    w: 1.95,
    h: 1.34,
    accent: COLORS.yellow,
    title: "部署上线",
    titleSize: 16,
    body: "平时表现正常",
    bodySize: 12.5,
  });
  addArrow(slide, 10.56, 3.02, 0.16);
  addCard(slide, {
    x: 10.82,
    y: pipelineY,
    w: 1.8,
    h: 1.34,
    accent: COLORS.red,
    title: "触发后",
    titleSize: 16,
    body: "走向攻击者想要的路径",
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 0.82,
    y: 4.38,
    w: 3.78,
    h: 1.36,
    accent: COLORS.teal,
    title: "触发器不一定是关键词",
    titleSize: 15,
    body: "它也可能是一种任务类型，比如“翻译”、某个环境条件，或者某条观察结果。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 4.82,
    y: 4.38,
    w: 3.78,
    h: 1.36,
    accent: COLORS.orange,
    title: "轨迹才是 Agent 的训练对象",
    titleSize: 15,
    body: "不是只有问答文本，而是完整的思考、动作、观察链条。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 8.82,
    y: 4.38,
    w: 3.5,
    h: 1.36,
    accent: COLORS.red,
    title: "因此它更隐蔽",
    titleSize: 15,
    body: "Agent 后门比传统 LLM 后门更难靠静态关键词或表面输出发现。",
    bodySize: 12.5,
  });

  addFooterSource(slide, "Research cue: Agent trajectory poisoning / LLM backdoor surveys. 讲原理即可，不必展开攻击教程。");
  addPageNumber(slide, 12);
  addNotes(
    slide,
    `
如果从神经网络的角度来理解，后门并不是写在模型里的一个显式 if-else，而更像是通过训练让模型在参数里记住了一种“条件反射”。

研究里常见的做法，是让模型在大量正常轨迹里，再混入少量带有特殊触发条件的异常轨迹。这里的轨迹不只是问题和答案，而是完整的“问题、思考、工具、观察、再思考”流程。

模型在微调时，就可能学到一种隐藏映射：平时表现正常，但一旦遇到某类触发器，就走向攻击者想要的那条路径。对 Agent 来说，这种触发器还不一定是关键词，它可能是一种任务类型、一个环境条件，或者某种外部观察结果。
    `
  );
  finalizeSlide(slide);
}

function slide13DefenseGaps() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "DEFENSES & LIMITATIONS", COLORS.yellow, "1D2337");
  addTitle(
    slide,
    "为什么 Agent 安全这么难防",
    "你同学原稿最后关于“现有防御与局限”的部分很值得保留，因为它能体现你们不是只会讲攻击，也理解研究难点。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.18,
    w: 5.52,
    h: 2.88,
    accent: COLORS.green,
    badge: "现有防线",
    badgeColor: COLORS.green,
    badgeW: 1.15,
    title: "大家现在已经在做什么",
    titleSize: 20,
    body:
      "1. 输入过滤：检查明显的 trigger 或 prompt injection\n2. 推理审查：用另一个模型去检查思维链\n3. 权限收缩：减少可调用工具和账号授权\n4. 沙箱隔离：尽量把危险动作关在受限环境里",
    bodySize: 13.1,
  });

  addCard(slide, {
    x: 6.72,
    y: 2.18,
    w: 5.58,
    h: 2.88,
    accent: COLORS.red,
    badge: "研究难点",
    badgeColor: COLORS.red,
    badgeW: 1.15,
    title: "为什么这些方法还是不够",
    titleSize: 20,
    body:
      "1. 触发器形式太多：可能在输入、环境、状态、记忆、工具描述里\n2. 多步推理很难归因：到底哪一步出了问题，常常说不清\n3. 审查成本高：检查者本身也可能被攻击\n4. 动态生态太快：网页、知识库、Skill 每天都在变化",
    bodySize: 13.05,
  });

  addCard(slide, {
    x: 0.84,
    y: 5.34,
    w: 3.68,
    h: 1.04,
    accent: COLORS.orange,
    title: "难点 1：多步归因",
    titleSize: 15,
    body: "长工具链里，很难定位究竟是哪一步触发了后门。",
    bodySize: 12.3,
  });
  addCard(slide, {
    x: 4.82,
    y: 5.34,
    w: 3.68,
    h: 1.04,
    accent: COLORS.teal,
    title: "难点 2：多 Agent 协作",
    titleSize: 15,
    body: "一个系统里往往不只一个 Agent，传播问题会更复杂。",
    bodySize: 12.3,
  });
  addCard(slide, {
    x: 8.8,
    y: 5.34,
    w: 3.52,
    h: 1.04,
    accent: COLORS.yellow,
    title: "难点 3：供应链",
    titleSize: 15,
    body: "Skill、插件、第三方服务一旦出问题，影响范围会迅速扩大。",
    bodySize: 12.3,
  });

  addFooterSource(slide, "课堂效果提示：这一页会让你们看起来更专业，因为它展示了“攻击之外的批判性思维”。");
  addPageNumber(slide, 13);
  addNotes(
    slide,
    `
前面我们讲了很多攻击，这一页要告诉老师：我们不是在“教别人怎么打”，而是在理解为什么这件事难防。

目前常见的防线包括输入过滤、推理审查、权限收缩和沙箱隔离。但问题在于，Agent 的触发器不再只有关键词，它可能藏在环境、状态、记忆、工具描述里；而且它是多步执行系统，很难像传统程序一样快速定位到底哪一步出了问题。

这也是为什么 Agent 安全仍然是一个活跃研究方向。你们可以把这页讲成“批判性思维”的展示页。
    `
  );
  finalizeSlide(slide);
}

function slide09Checklist() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "PRACTICAL SAFETY", COLORS.green, "1B2537");
  addTitle(
    slide,
    "先落回本地场景：OpenClaw 桌面端和各种 CLI Agent 怎么用得更安全",
    "这一页只讲本地工具：终端、浏览器自动化、桌面 Agent、脚本执行。把本地场景讲透，建议会更有操作性。"
  );

  addCard(slide, {
    x: 0.74,
    y: 2.33,
    w: 3.95,
    h: 3.46,
    accent: COLORS.green,
    badge: "权限",
    badgeColor: COLORS.green,
    badgeW: 0.9,
    title: "先管权限，再谈效率",
    titleSize: 19,
    body:
      "1. 默认最小权限，不要一上来就给管理员权限\n2. 不把主力邮箱、网盘、GitHub、服务器权限一次性全接进去\n3. 能分开授权的功能，不要图省事全部打通",
    bodySize: 13.4,
  });

  addCard(slide, {
    x: 4.9,
    y: 2.33,
    w: 3.95,
    h: 3.46,
    accent: COLORS.yellow,
    badge: "隔离",
    badgeColor: COLORS.yellow,
    badgeW: 0.9,
    title: "把实验环境和日常环境分开",
    titleSize: 19,
    body:
      "1. 尽量用独立工作目录、独立账号、独立浏览器 profile\n2. 条件允许的话，用容器、沙箱或虚拟机隔离\n3. 不要让课程演示直接碰到你的真实项目、真实文件和长期凭证",
    bodySize: 13.4,
  });

  addCard(slide, {
    x: 9.06,
    y: 2.33,
    w: 3.52,
    h: 3.46,
    accent: COLORS.orange,
    badge: "回滚",
    badgeColor: COLORS.orange,
    badgeW: 0.9,
    title: "让重要操作可追踪、可中止、可回滚",
    titleSize: 18,
    body:
      "1. 在测试账号和假数据上先验证，不要直接上生产环境\n2. 重要命令最好保留日志，知道它调了什么工具\n3. 对高风险动作加人工确认，不让 Agent 一步到位直接执行",
    bodySize: 13.2,
  });

  slide.addShape("roundRect", {
    x: 0.82,
    y: 5.95,
    w: 11.76,
    h: 0.84,
    fill: { color: COLORS.panelDark },
    line: { color: COLORS.border, pt: 1 },
    shadow: safeOuterShadow("000000", 0.2, 45, 2, 1),
  });
  slide.addShape("rect", {
    x: 0.82,
    y: 5.95,
    w: 0.06,
    h: 0.84,
    line: { color: COLORS.teal, transparency: 100, pt: 0 },
    fill: { color: COLORS.teal },
  });
  slide.addText("本地工具的判断标准", {
    x: 1.02,
    y: 6.22,
    w: 1.7,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 14,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("如果一个 AI 有手有脚、能读文件、能跑命令，那你就要先给它沙盒，再给它任务。", {
    x: 2.98,
    y: 6.22,
    w: 9.0,
    h: 0.22,
    fontFace: FONTS.body,
    fontSize: 12.7,
    color: COLORS.muted,
    margin: 0,
  });

  addFooterSource(slide, "OpenClaw 官方文档也强调：沙箱不是万能，但它能明显缩小出事后的影响范围。");
  addPageNumber(slide, 14);
  addNotes(
    slide,
    `
这一页我们故意只讲“本地工具”这一种场景，不把所有建议都混在一起。因为对很多计算机学生来说，真正高风险的往往就是本地 Agent、CLI 工具、浏览器自动化和脚本执行。

第一，权限最小化。第二，环境隔离。第三，重要动作可追踪、可回滚。你们在台上可以把它讲成一句话：先别急着追求方便，先问这个 Agent 今天到底能看到什么、能碰到什么、能做到什么。

这一页讲完，再下一页去讲插件、网页版 AI 和团队协作，逻辑就会很自然。
    `
  );
  finalizeSlide(slide);
}

function slide15WebSafety() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "WEB / SKILL SAFETY", COLORS.orange);
  addTitle(
    slide,
    "插件、网页版 AI 和团队协作，最容易忽略哪些安全细节",
    "这一页把“插件 / Skill”“网页 AI / OAuth”“小组协作习惯”拆开讲，听众会更容易带走可执行建议。"
  );

  addCard(slide, {
    x: 0.82,
    y: 2.2,
    w: 3.72,
    h: 3.22,
    accent: COLORS.yellow,
    badge: "插件 / Skill",
    badgeColor: COLORS.yellow,
    badgeW: 1.25,
    title: "不要把“热门插件”默认等同于“安全”",
    titleSize: 18,
    body:
      "1. 把它当成可执行代码，而不是功能说明书\n2. 先看作者、仓库、权限范围、调用目标\n3. 不要把主力邮箱、网盘、GitHub 一次性全接进去",
    bodySize: 13.15,
  });

  addCard(slide, {
    x: 4.82,
    y: 2.2,
    w: 3.72,
    h: 3.22,
    accent: COLORS.orange,
    badge: "网页 AI / OAuth",
    badgeColor: COLORS.orange,
    badgeW: 1.45,
    title: "别把云端 AI 当作“安全收纳箱”",
    titleSize: 18,
    body:
      "1. 不随手上传源码、密钥、隐私和内部材料\n2. 连接第三方服务前先看 scope 和授权范围\n3. 对网页、邮件、PDF、附件始终保持不信任",
    bodySize: 13.15,
  });

  addCard(slide, {
    x: 8.82,
    y: 2.2,
    w: 3.5,
    h: 3.22,
    accent: COLORS.teal,
    badge: "小组协作",
    badgeColor: COLORS.teal,
    badgeW: 1.1,
    title: "做课程项目时的最低安全习惯",
    titleSize: 18,
    body:
      "1. 演示尽量用假数据，不用真实账号和真实密钥\n2. 统一一份“接权限前检查表”\n3. 重要操作保留日志，出了问题能及时定位",
    bodySize: 13.1,
  });

  addCard(slide, {
    x: 0.84,
    y: 5.72,
    w: 11.48,
    h: 0.72,
    fill: COLORS.panelDark,
    line: COLORS.border,
    accent: COLORS.green,
    title: "最值得带走的一句话",
    titleSize: 15,
    body: "能用假数据就不用真数据，能收缩授权就别全开，能审查插件就不要盲装。",
    bodySize: 12.8,
    bodyY: 5.99,
    bodyH: 0.22,
  });

  addFooterSource(slide, "这一页适合落到“同学们今天下课后就能开始做什么”。");
  addPageNumber(slide, 15);
  addNotes(
    slide,
    `
前一页我们讲的是本地 Agent 和 CLI，这一页就专门讲最容易被大家忽略的三件事：插件、网页 AI、以及团队协作时的安全习惯。

插件和 Skill 最大的问题是：大家很容易把“热门”误认为“安全”。网页版 AI 最大的问题是：大家很容易把云端当作安全收纳箱。团队协作最大的问题则是：大家为了演示方便，常常直接用真账号、真数据、真权限。

所以这一页的核心作用，是把前面的理论落到非常具体的“马上就能执行的习惯”上。
    `
  );
  finalizeSlide(slide);
}

function slide10Conclusion() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "TAKEAWAY", COLORS.orange);
  slide.addText("AI 越会做事，安全边界越重要", {
    x: 1.0,
    y: 1.35,
    w: 11.0,
    h: 0.72,
    fontFace: FONTS.head,
    fontSize: 30,
    bold: true,
    align: "center",
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("未来评价一个 AI 系统，不能只看它聪不聪明，还要看它被允许做什么。", {
    x: 1.45,
    y: 2.18,
    w: 10.2,
    h: 0.34,
    fontFace: FONTS.body,
    fontSize: 13,
    align: "center",
    color: COLORS.muted,
    margin: 0,
  });

  addCard(slide, {
    x: 1.1,
    y: 3.1,
    w: 3.45,
    h: 1.78,
    accent: COLORS.orange,
    title: "Chatbot 风险",
    titleSize: 18,
    body: "更偏向“说错话”\n输出可能有误、有害或被操纵。",
    bodySize: 14,
  });
  addCard(slide, {
    x: 4.95,
    y: 3.1,
    w: 3.45,
    h: 1.78,
    accent: COLORS.red,
    title: "Agent 风险",
    titleSize: 18,
    body: "更偏向“做错事”\n错误行动可能带来真实系统后果。",
    bodySize: 14,
  });
  addCard(slide, {
    x: 8.8,
    y: 3.1,
    w: 3.45,
    h: 1.78,
    accent: COLORS.green,
    title: "真正的重点",
    titleSize: 18,
    body: "能力越强，越要限制权限、隔离环境、审查工具链。",
    bodySize: 14,
  });

  slide.addText("谢谢大家，欢迎提问", {
    x: 3.8,
    y: 5.56,
    w: 5.8,
    h: 0.42,
    fontFace: FONTS.head,
    fontSize: 20,
    bold: true,
    color: COLORS.teal,
    align: "center",
    margin: 0,
  });

  addFooterSource(slide, "Closing line: 当 AI 开始替你行动时，安全就必须和能力一起被设计。");
  addPageNumber(slide, 16);
  addNotes(
    slide,
    `
最后我们想用一句话收尾：从 chatbot 到 agent，风险的升级不是从“会不会说错”到“会不会说得更像”，而是从“会不会说错话”到“会不会做错事”。

所以未来评价一个 AI 系统，不能只看它聪不聪明，还要看它有没有被妥善约束、它的工具边界清不清楚、它出了问题以后能造成多大后果。

希望今天这 20 分钟，大家带走的不只是几个安全术语，而是一个更重要的判断标准：当 AI 开始替你行动时，安全就必须和能力一起被设计。
    `
  );
  finalizeSlide(slide);
}

function slide11References() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide, "REFERENCES", COLORS.blue, "1A2338");
  addTitle(
    slide,
    "参考资料",
    "这一页给老师或同学追问时使用，台上无需逐条朗读。"
  );

  addCard(slide, {
    x: 0.86,
    y: 2.28,
    w: 3.84,
    h: 3.88,
    accent: COLORS.teal,
    badge: "官方文档",
    badgeColor: COLORS.teal,
    badgeW: 1.2,
    title: "OpenClaw",
    titleSize: 19,
    body:
      "1. OpenClaw Docs\nhttps://docs.openclaw.ai/\n\n2. OpenClaw Security\nhttps://docs.openclaw.ai/security\n\n3. Sandboxing\nhttps://docs.openclaw.ai/sandboxing",
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 4.95,
    y: 2.28,
    w: 3.84,
    h: 3.88,
    accent: COLORS.orange,
    badge: "研究综述",
    badgeColor: COLORS.orange,
    badgeW: 1.2,
    title: "Survey / Backdoor / Agent Safety",
    titleSize: 17,
    body:
      "1. A Survey on Trustworthy LLM Agents: Threats and Countermeasures\narXiv:2503.09648\n\n2. A Survey on Backdoor Threats in Large Language Models (LLMs)\narXiv:2502.05224",
    bodySize: 12,
  });

  addCard(slide, {
    x: 9.04,
    y: 2.28,
    w: 3.44,
    h: 3.88,
    accent: COLORS.green,
    badge: "媒体背景",
    badgeColor: COLORS.green,
    badgeW: 1.05,
    title: "用于解释“为什么最近大家在谈”",
    titleSize: 16,
    body:
      "1. Reuters / Yahoo转载\n2026-02-05\n\n2. Business Insider\n2026-03-12\n\n3. Tom's Hardware\n2026-03-13",
    bodySize: 12.2,
  });

  addFooterSource(slide, "如果老师希望更学术一些，你们可以重点指向两篇 survey 和 OpenClaw 官方安全文档。");
  addPageNumber(slide, 17);
  addNotes(
    slide,
    `
这页一般不需要口述。如果老师追问来源，你们就说三类：第一是 OpenClaw 官方安全文档，第二是 LLM backdoor 和 trustworthy agents 的 survey，第三是解释为什么这个话题最近特别热的媒体背景。
    `
  );
  finalizeSlide(slide);
}

async function main() {
  slide01Cover();
  slide02Roadmap();
  slide02WhyCare();
  slide03ReAct();
  slide05OpenClawReality();
  slide04AttackMap();
  slide07QueryAttack();
  slide05Observation();
  slide06ThoughtHijack();
  slide07SkillPoison();
  slide11AttackChain();
  slide08BackdoorMechanism();
  slide13DefenseGaps();
  slide09Checklist();
  slide15WebSafety();
  slide10Conclusion();
  slide11References();

  const outPath = path.join(__dirname, "output", "AI-Agent-Security-Pre.pptx");
  await pptx.writeFile({ fileName: outPath });
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
