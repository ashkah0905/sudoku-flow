# sudoku-flow

## 概要
`sudoku-flow` は、数独の生成から解答までを自動実行し、手順を可視化するシングルページアプリです。  
候補（メモ）計算、確定、推測、矛盾検出、バックトラックの流れをリアルタイムで表示します。

## 現在の構成
- 実装ファイル: `index.html` のみ（HTML / CSS / JavaScript を同梱）
- ビルド・依存関係: なし
- 実行環境: モダンブラウザ

## 主な機能
- 自動問題生成
  - 完成盤面を生成後、難易度に応じて空欄化して問題化
  - 難易度:
    - `CALM`: 34-38 マスを空欄化（行・3x3ブロックのヒント数下限を補正）
    - `CHAOS`: 68-72 マスを空欄化
- 自動解答フロー
  - 候補スキャン（`phaseMemoFill`）
  - 単一候補の確定（`CONFIRM`）
  - 最小候補セルでの推測（`GUESS`）
  - 矛盾時の復元（`BACKTRACK`）
- サイクル実行
  - 解答完了後 5 秒カウントダウンして次の盤面を自動生成
  - 完了時に `Solve / Backtracks / Guesses` をステータス表示
- UI
  - 難易度切替: `CALM` / `CHAOS`
  - テーマ切替: `Light` / `Dark` / `Sepia` / `Neon`
  - 速度調整: `50ms - 4000ms` スライダー
  - フォーカス移動、行列クロスヘア、ユニット完成フラッシュ、矛盾セル強調

## 使い方
1. `index.html` をブラウザで開く
2. 難易度・テーマ・速度を必要に応じて変更する
3. 盤面生成と解答サイクルが自動で継続実行される

## DEBUG ログ
`index.html` 内の `DEBUG` 定数でログ出力を切り替えます。

- `true`: コンソールにログ出力
- `false`: ログなし（デフォルト）

主なイベント:
- `cycle_start` / `cycle_end`
- `phase_duration`
- `action_selected`
- `backtrack`
- `calm_guard`

ログ形式:
- `[sudoku-flow] <event>` + payload

## ロジック概要
- 盤面生成: `generateFullGrid`, `generatePuzzle`
- 候補計算: `phaseMemoFill`, `canPlace`
- 行動選択: `findNextAction`（`CONTRADICTION` / `CONFIRM` / `GUESS`）
- 復元処理: `saveHistory`, `backtrack`
- 描画更新: `updateDisplay`, `renderCellContent`, `renderMemos`
- サイクル制御: `startCycle`, `phaseComplete`, `restart`

## 補足
- `CHAOS` ではバックトラック回数が 20 を超えると安全のため盤面を再生成します。
- 開発・実験用途を想定し、保存機能や手動入力 UI は実装していません。

