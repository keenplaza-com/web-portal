#!/bin/sh
# Vercel install step: kvcl is a sibling repo locally (file:../../kvcl), so on Vercel
# clone it into .kvcl and point package.json there. The build cache restores .kvcl,
# hence the rm.
set -e
rm -rf .kvcl
git clone --depth 1 https://github.com/keenvector-in/kvcl.git .kvcl
npm --prefix .kvcl install --no-audit --no-fund
npm --prefix .kvcl run build
sed -i 's#file:../../kvcl#file:./.kvcl#' package.json
npm install --no-audit --no-fund
