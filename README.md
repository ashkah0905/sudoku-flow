# sudoku-flow

## プロジェクト概要
`sudoku-flow` は、数独の生成から解答までを自動で可視化するシングルページアプリです。  
盤面の状態変化、候補埋め、仮説検証、バックトラックの流れをブラウザ上で確認できます。

## 主な機能
- 自動生成: 完成盤面を作成し、難易度に応じてマスを空欄化して問題を生成
- 自動解答: 候補（メモ）計算、確定、仮説、矛盾時のバックトラックを繰り返して解答
- 難易度モード:
  - `CALM`: 空欄少なめ（易しめ）
  - `CHAOS`: 空欄多め（難しめ）

## 使い方
1. `index.html` をブラウザで開く
2. 画面上で難易度（`CALM` / `CHAOS`）や速度を調整する
3. 自動で問題生成と解答サイクルが進行する

## DEBUGログ
開発用ログは `index.html` 内の `DEBUG` フラグで切り替えできます。

- `true`: コンソールにログを出力
- `false`: ログを出力しない（デフォルト）

出力される主なイベント:
- `cycle_start` / `cycle_end`
- `phase_duration`
- `action_selected`
- `backtrack`

ログ形式:
- `[sudoku-flow] <event>` と payload オブジェクト

## コード構造（簡易）
- `index.html`
  - UI/CSS: 盤面、ステータス、テーマ、速度スライダー
  - データモデル: `Cell` クラス（値・候補・DOM参照など）
  - 盤面生成: `generateFullGrid`, `isValid`
  - アプリ本体: `App` オブジェクト
    - サイクル制御: `startCycle`, `restart`, `phaseComplete`
    - 解答処理: `phaseMemoFill`, `phaseSolve`, `findNextAction`, `backtrack`
    - 描画更新: `createDOM`, `updateDisplay`, `renderCellContent`, `renderMemos`
