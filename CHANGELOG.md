# Changelog

All notable changes to XML Dump will be documented in this file.

## 0.1.3

- Added `XML Dump: Selection` so valid XML selected inside any editor can open directly in the dump viewer.
- Exposed the selection command in editor context menus and the Command Palette when text is selected.
- Updated release text to reflect the new selection-based workflow alongside full-document and clipboard dumps.

## 0.1.2

- Added support for opening XML Dump from unsaved editors by validating the in-memory document content instead of requiring a saved `.xml` file first.
- Added an `XML Dump: Clipboard` command so copied XML can open directly in the dump viewer.
- Expanded command availability in editor menus and refreshed Marketplace text to reflect the new unsaved-editor and clipboard workflows.

## 0.1.1

- Initial XML dump viewer release with interactive cfdump-style rendering for `.xml` documents.
- Supports collapsible element tables, inline attribute and text display, natural and alphabetical attribute ordering, and inline XML parse error diagnostics.
- Updated the dump panel title to include the active XML file name and aligned file loading and local resource handling with VS Code-native URI APIs.
- Prepared the extension for Marketplace publishing with public GitHub repository metadata, release automation, refreshed element styling, and updated icon and preview assets.
