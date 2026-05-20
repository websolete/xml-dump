# XML Dump

XML Dump turns raw XML into an interactive dump view inspired by `cfdump`. Open a `.xml` document and inspect nested data in a dedicated webview with collapsible tables and switchable attribute ordering.

![XML Dump preview](images/preview.png)

## Features

- Open valid `.xml` documents directly from Explorer, the active editor tab, or the Command Palette.
- Render elements as collapsible tables showing tag name, attributes, and child elements.
- Attributes display with an `@` prefix in a distinct teal style, separate from child element rows.
- Simple leaf elements (no attributes, no child elements) render as inline scalars for quick scanning.
- Collapse or expand nested structures from the header row or the key column.
- Toggle between natural attribute order and `Sort Attrs A→Z` from the webview toolbar.
- Parse errors are shown inline in the webview with the parser's diagnostic message.

## Usage

1. Open a `.xml` document.
2. Run `XML Dump` from Explorer, the editor title menu, or the Command Palette while that document is active.
3. Explore nested nodes in the webview.
4. Use `Sort Attrs A→Z` or `Natural Attr Order` in the editor title while the dump panel is active.

## What It Looks Like

XML Dump uses a purple element style with teal attribute highlights:

- Elements render as purple `<tagName>` tables with a header showing attr and child counts.
- Attributes display as `@name` rows with teal keys.
- Text content of leaf elements renders as inline scalars (orange) — no extra nesting.
- Mixed elements (attributes + children, or attributes + text) show all rows in one table.
- Parse errors display inline with the raw parser diagnostic.

## Changelog

Release notes are included with the extension changelog.
