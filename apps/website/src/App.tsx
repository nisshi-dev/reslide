import { reslideComponents } from "@reslide-dev/core/mdx-components";
// @ts-expect-error MDX module has no type declarations
import Slides from "../slides.mdx";

const GITHUB_URL = "https://github.com/nisshi-dev/reslide";
const NPM_URL = "https://www.npmjs.com/package/@reslide-dev/core";

export function App() {
  return (
    <div className="lp">
      <Nav />
      <Hero />
      <Features />
      <Demo>
        <Slides components={reslideComponents} />
      </Demo>
      <CodeExample />
      <GetStarted />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <a href="/" className="lp-nav-logo">
          reslide
        </a>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#get-started">Get Started</a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-content">
        <h1 className="lp-hero-title">reslide</h1>
        <p className="lp-hero-subtitle">
          React + MDX ベースの
          <br />
          プレゼンテーションフレームワーク
        </p>
        <p className="lp-hero-description">
          MDX でスライドを書いて、React コンポーネントを自由に埋め込める。
          <br />
          Vite の高速 HMR で快適な開発体験。Next.js / Remix / Vite 等あらゆる React
          プロジェクトで動作。
        </p>
        <div className="lp-hero-actions">
          <a href="#get-started" className="lp-btn lp-btn-primary">
            Get Started
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn lp-btn-secondary"
          >
            GitHub
          </a>
        </div>
        <div className="lp-hero-badges">
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.shields.io/npm/v/@reslide-dev/core?style=flat-square&color=16a34a"
              alt="npm version"
            />
          </a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.shields.io/badge/license-MIT-green?style=flat-square"
              alt="MIT License"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

const FEATURE_LIST = [
  {
    title: "MDX でスライドを記述",
    description:
      "Markdown の手軽さと React コンポーネントの表現力を両立。--- で区切るだけでスライドに。",
    icon: "M",
  },
  {
    title: "フレームワーク非依存",
    description:
      "Next.js、Remix、Vite、どんな React プロジェクトにも組み込める純粋な React コンポーネント。",
    icon: "R",
  },
  {
    title: "KaTeX & Mermaid",
    description: "数式やフローチャートをネイティブサポート。技術プレゼンテーションに最適。",
    icon: "∑",
  },
  {
    title: "クリックアニメーション",
    description: "::click ディレクティブで段階的なコンテンツ表示。Slidev ライクな操作感。",
    icon: "▶",
  },
  {
    title: "Shiki 構文ハイライト",
    description: "ビルド時にコードブロックを美しくハイライト。行単位の強調表示にも対応。",
    icon: "<>",
  },
  {
    title: "プレゼンターモード",
    description: "別ウィンドウでノート・タイマーを表示。描画モードでフリーハンド注釈も可能。",
    icon: "P",
  },
] as const;

function Features() {
  return (
    <section id="features" className="lp-features">
      <div className="lp-section-inner">
        <h2 className="lp-section-title">Features</h2>
        <div className="lp-features-grid">
          {FEATURE_LIST.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demo({ children }: { children: React.ReactNode }) {
  return (
    <section id="demo" className="lp-demo">
      <div className="lp-section-inner">
        <h2 className="lp-section-title">Live Demo</h2>
        <p className="lp-section-description">
          実際に操作できます。← → キーまたは画面端クリックでスライド移動。Space で次へ。
        </p>
        <div className="lp-demo-frame">{children}</div>
      </div>
    </section>
  );
}

const CODE_EXAMPLE = `---
layout: center
---

# My Presentation

React + MDX で書くスライド

---

## Features

::click

- First point

::click

- Second point with :highlight[emphasis]

---

## Math & Diagrams

Inline: $E = mc^2$

<Mermaid>
graph LR
  A --> B --> C
</Mermaid>`;

function CodeExample() {
  return (
    <section className="lp-code-example">
      <div className="lp-section-inner">
        <h2 className="lp-section-title">Write Slides in MDX</h2>
        <p className="lp-section-description">
          Markdown の <code>---</code> でスライドを区切り、React
          コンポーネントや数式を自由に埋め込める
        </p>
        <div className="lp-code-block">
          <div className="lp-code-header">
            <span className="lp-code-dot" />
            <span className="lp-code-dot" />
            <span className="lp-code-dot" />
            <span className="lp-code-filename">slides.mdx</span>
          </div>
          <pre>
            <code>{CODE_EXAMPLE}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section id="get-started" className="lp-get-started">
      <div className="lp-section-inner">
        <h2 className="lp-section-title">Get Started</h2>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-number">1</div>
            <div>
              <h3>Install</h3>
              <div className="lp-code-inline">
                <code>npm install @reslide-dev/core</code>
              </div>
            </div>
          </div>
          <div className="lp-step">
            <div className="lp-step-number">2</div>
            <div>
              <h3>Write slides</h3>
              <p>
                <code>slides.mdx</code> にスライドを記述。<code>---</code> で区切るだけ。
              </p>
            </div>
          </div>
          <div className="lp-step">
            <div className="lp-step-number">3</div>
            <div>
              <h3>Render</h3>
              <div className="lp-code-inline">
                <code>{"<Slides components={reslideComponents} />"}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-section-inner">
        <div className="lp-footer-content">
          <div>
            <span className="lp-footer-logo">reslide</span>
            <p>&copy; 2026 nisshi-dev</p>
          </div>
          <div className="lp-footer-links">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
              npm
            </a>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
              MIT License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
