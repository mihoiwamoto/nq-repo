#!/bin/sh
# Vercel のビルド（vercel.json の buildCommand）。React（react-src/）を /react/ 用にビルドし、
# 画面設計・プロトタイプ・画像・控えと一緒に .vercel-out/ へまとめる。react-src の node_modules を配らないため、出力はリポジトリの直下にしない
set -e
cd "$(dirname "$0")/.."
(cd react-src && npm run build:kit)
rm -rf .vercel-out && mkdir .vercel-out
cp nqrepo-screen-design.html nqrepo-demo.html .vercel-out/
cp -R images snapshots .vercel-out/
cp -R react-src/dist-kit .vercel-out/react
