# Changelog

All notable changes to XML Dump will be documented in this file.

## 0.1.0

- Prepared the extension for Marketplace publishing with public GitHub repository metadata and release automation.
- Updated the dump panel title to include the active XML file name and aligned file handling with VS Code-native URI APIs.
- Refined the dump presentation with refreshed element styling and an updated extension icon.

## 0.0.1

- Initial release of XML Dump.
- Renders `.xml` documents as interactive cfdump-style webviews.
- Elements display as collapsible purple tables with tag name, attribute count, and child count in the header.
- Attributes display as `@name` rows with teal styling, separate from child element rows.
- Simple leaf elements (no attributes, no children) render as inline scalar strings.
- Elements with attributes but no child elements show a `#text` row for text content.
- Natural attribute order and alphabetical sort toggle available in the editor title bar.
- Inline parse error display when the XML is not well-formed.
