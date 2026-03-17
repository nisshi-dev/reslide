import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck, Slide, Click, ClickSteps, Mark } from "@reslide-dev/core";
import "../../packages/core/src/themes/default.css";
import "./style.css";

function DemoSlides() {
  return (
    <Deck transition="slide-left">
      <Slide layout="center">
        <h1>reslide</h1>
        <p>React + MDX ベースのプレゼンテーションフレームワーク</p>
      </Slide>

      <Slide>
        <h2>特徴</h2>
        <ClickSteps count={3} />
        <ul>
          <li>React ネイティブ — Vue 依存なし</li>
          <Click at={1}>
            <li>MDX でスライドを記述</li>
          </Click>
          <Click at={2}>
            <li>Vite ベース — 高速な HMR</li>
          </Click>
          <Click at={3}>
            <li>カスタム React コンポーネントを埋め込み可能</li>
          </Click>
        </ul>
      </Slide>

      <Slide layout="two-cols">
        <div>
          <h2>左カラム</h2>
          <p>コードやテキストを配置</p>
          <pre
            style={{
              background: "#1e293b",
              color: "#e2e8f0",
              padding: "1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            {`import { Deck, Slide } from '@reslide-dev/core'

function App() {
  return (
    <Deck>
      <Slide>Hello!</Slide>
    </Deck>
  )
}`}
          </pre>
        </div>
        <div>
          <h2>右カラム</h2>
          <ul>
            <li>React 19 対応</li>
            <li>TypeScript 完全サポート</li>
            <li>フレームワーク非依存</li>
          </ul>
        </div>
      </Slide>

      <Slide layout="section">
        <h1>セクション区切り</h1>
        <p>新しいトピックへ</p>
      </Slide>

      <Slide layout="quote">
        <p>The best way to predict the future is to invent it.</p>
        <p style={{ marginTop: "1rem", opacity: 0.6 }}>— Alan Kay</p>
      </Slide>

      <Slide>
        <h2>テキストハイライト</h2>
        <p>
          <Mark type="highlight" color="yellow">
            ハイライト
          </Mark>
          、
          <Mark type="underline" color="blue">
            アンダーライン
          </Mark>
          、
          <Mark type="circle" color="red">
            サークル
          </Mark>{" "}
          の3種類
        </p>
      </Slide>

      <Slide layout="center">
        <h1>ありがとうございました</h1>
        <p>←→ キーでスライド移動 / Space で次へ / Escape で概要モード</p>
      </Slide>
    </Deck>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoSlides />
  </StrictMode>,
);
