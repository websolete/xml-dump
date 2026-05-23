# XML Dump

XML Dump visualizes raw XML as an interactive dump view inspired by `cfdump`. Open a `.xml` document and inspect nested data in a dedicated webview with collapsible tables and switchable attribute ordering.

![XML Dump preview](images/preview.png)

## Features

- Open valid `.xml` documents directly from Explorer, the active editor tab, or the Command Palette.
- Renders XML elements as nested tables with separate attribute and child rows.
- Collapse or expand nested structures from the header row or the key column.
- Toggle between natural attribute order and `Sort Attrs A->Z` from the editor title while the dump panel is active.
- Keeps leaf text and attributes easy to scan with distinct styling for elements, attributes, and scalar content.
- Shows XML parse errors inline in the dump panel with the parser diagnostic.

## Usage

1. Open a `.xml` document with `XML Dump` directly from the file explorer, or
2. With an XML document open, run `XML Dump` from the editor title menu, or the Command Palette while that document is active.
3. The viewer opens in a new tab.
4. Explore nested nodes in the webview, collapse or expand nodes by clicking their key columns or headers.
5. Use `Sort Attrs A->Z` or `Natural Attr Order` in the editor title while the dump panel is active.

## Changelog

Release notes are included with the extension changelog.
