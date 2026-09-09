#!/bin/sh
# Extract the script, syntax-check it, then run every suite.
# t_browser.js needs Playwright with chromium; it skips itself, exiting 0, if that is absent.
set -e
cd "$(dirname "$0")/.."
python3 -c "import re;print(re.search(r'<script>(.*?)</script>',open('hexdraw.html').read(),re.S).group(1))" > tests/app.js
node --check tests/app.js
cp tests/app.js tests/check.js
cd tests
fail=0
for f in t_*.js; do
  echo "=== $f ==="
  node "$f" || fail=1
done
rm -f app.js check.js
exit $fail
