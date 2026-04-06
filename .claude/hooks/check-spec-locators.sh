#!/bin/bash
# Pre-tool-use hook: block raw locators in spec files
# Fires on Edit|Write tool calls. Reads tool input from stdin.

INPUT=$(cat)

# Extract file_path and content using node (available on this machine)
PARSED=$(echo "$INPUT" | node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(chunks.join(''));
    const ti = d.tool_input || {};
    const fp = ti.file_path || '';
    const content = ti.content || ti.new_string || '';
    process.stdout.write(fp + '\n---SEP---\n' + content);
  } catch {
    process.stdout.write('\n---SEP---\n');
  }
});
" 2>/dev/null)

FILE_PATH=$(echo "$PARSED" | sed -n '1p')
CONTENT=$(echo "$PARSED" | sed '1,/---SEP---/d')

# Only check spec files
if [[ ! "$FILE_PATH" =~ tests[/\\].*\.spec\.ts$ ]]; then
  exit 0
fi

if [ -z "$CONTENT" ]; then
  exit 0
fi

# Check for raw locator patterns
# Exclude comments (lines starting with // or *) to reduce false positives
VIOLATIONS=$(echo "$CONTENT" | grep -nE '(data-cy|getByText\(|getByRole\(|getByTestId\(|\.locator\()' | grep -vE '^\s*(//|/?\*)' || true)

if [ -n "$VIOLATIONS" ]; then
  echo "BLOCKED: Raw locators detected in spec file." >&2
  echo "" >&2
  echo "File: $FILE_PATH" >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" | head -5 >&2
  echo "" >&2
  echo "All selectors must live in page objects (pages/**/*.ts)." >&2
  echo "Add the selector to the relevant page object, then use the page object method in your spec." >&2
  exit 2
fi

exit 0
