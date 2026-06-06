import * as path from 'path';
import * as vscode from 'vscode';
import { XMLValidator } from 'fast-xml-parser';

export function activate(context: vscode.ExtensionContext) {
  let activePanel: vscode.WebviewPanel | undefined;

  const showXmlDump = (sourceName: string, raw: string) => {
    const panelTitle = `XML Dump: ${sourceName}`;

    const panel = vscode.window.createWebviewPanel(
      'xmlDump',
      panelTitle,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );

    const cssUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'media', 'dump.css')
    );
    const jsUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'media', 'dump.js')
    );

    panel.webview.html = buildHtml(panel.webview, cssUri, jsUri, panelTitle, raw);

    activePanel = panel;

    panel.onDidDispose(() => {
      if (activePanel === panel) {
        activePanel = undefined;
      }
    });
  };

  const showRawDump = (sourceName: string, raw: string, sourceLabel: string) => {
    const validationMessage = getXmlValidationMessage(raw, sourceLabel);
    if (validationMessage) {
      vscode.window.showErrorMessage(`XML Dump: ${validationMessage}`);
      return;
    }

    try {
      showXmlDump(sourceName, raw);
    } catch {
      vscode.window.showErrorMessage('XML Dump: Could not open the dump viewer.');
    }
  };

  const showDump = vscode.commands.registerCommand('xmlDump.showDump', async (uri?: vscode.Uri) => {
    const editor = vscode.window.activeTextEditor;
    const activeDocument = editor?.document;
    const document = uri
      ? activeDocument?.uri.toString() === uri.toString()
        ? activeDocument
        : vscode.workspace.textDocuments.find(candidate => candidate.uri.toString() === uri.toString())
      : activeDocument;
    const targetUri = uri ?? document?.uri;

    if (!targetUri) {
      vscode.window.showErrorMessage('XML Dump: Open a document with valid XML first.');
      return;
    }

    let raw: string;
    let sourceName: string;
    if (document && document.uri.toString() === targetUri.toString()) {
      raw = document.getText();
      sourceName = getDocumentLabel(document);
    } else {
      const targetPath = targetUri.fsPath;
      if (path.extname(targetPath).toLowerCase() !== '.xml') {
        vscode.window.showErrorMessage('XML Dump: Only .xml files are supported from the explorer.');
        return;
      }

      try {
        const bytes = await vscode.workspace.fs.readFile(targetUri);
        raw = Buffer.from(bytes).toString('utf8');
        sourceName = path.basename(targetPath);
      } catch {
        vscode.window.showErrorMessage('XML Dump: Could not read file.');
        return;
      }
    }

    showRawDump(sourceName, raw, 'Content');
  });

  const showSelectionDump = vscode.commands.registerCommand('xmlDump.showSelectionDump', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('XML Dump: Select valid XML first.');
      return;
    }

    const selection = editor.selections.find(candidate => !candidate.isEmpty);
    if (!selection) {
      vscode.window.showErrorMessage('XML Dump: Select valid XML first.');
      return;
    }

    const raw = editor.document.getText(selection);
    if (!raw.trim()) {
      vscode.window.showErrorMessage('XML Dump: Selected text is empty.');
      return;
    }

    showRawDump(`${getDocumentLabel(editor.document)} (selection)`, raw, 'Selected text');
  });

  const showClipboardDump = vscode.commands.registerCommand('xmlDump.showClipboardDump', async () => {
    const raw = await vscode.env.clipboard.readText();
    if (!raw.trim()) {
      vscode.window.showErrorMessage('XML Dump: Clipboard is empty.');
      return;
    }

    showRawDump('Clipboard', raw, 'Clipboard');
  });

  const sortAlpha = vscode.commands.registerCommand('xmlDump.sortAlpha', () => {
    activePanel?.webview.postMessage({ command: 'setSort', alpha: true });
  });

  const sortNatural = vscode.commands.registerCommand('xmlDump.sortNatural', () => {
    activePanel?.webview.postMessage({ command: 'setSort', alpha: false });
  });

  const expandAll = vscode.commands.registerCommand('xmlDump.expandAll', () => {
    activePanel?.webview.postMessage({ command: 'setCollapsed', collapsed: false });
  });

  const collapseAll = vscode.commands.registerCommand('xmlDump.collapseAll', () => {
    activePanel?.webview.postMessage({ command: 'setCollapsed', collapsed: true });
  });

  context.subscriptions.push(
    showDump,
    showSelectionDump,
    showClipboardDump,
    sortAlpha,
    sortNatural,
    expandAll,
    collapseAll
  );
}

function getDocumentLabel(document: vscode.TextDocument): string {
  return document.isUntitled ? document.fileName : path.basename(document.fileName);
}

function getXmlValidationMessage(raw: string, sourceName: string): string | undefined {
  if (!raw.trim()) {
    return `${sourceName} is empty.`;
  }

  const validationResult = XMLValidator.validate(raw);
  if (validationResult === true) {
    return undefined;
  }

  const { msg, line, col } = validationResult.err;
  return `${sourceName} does not contain valid XML (${msg} at line ${line}, column ${col}).`;
}

function buildHtml(
  webview: vscode.Webview,
  cssUri: vscode.Uri,
  jsUri: vscode.Uri,
  title: string,
  xmlRaw: string
): string {
  const nonce = getNonce();
  const safeXml = serializeForInlineScript(xmlRaw);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${webview.cspSource};
             script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${cssUri}">
  <title>${title}</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${jsUri}"></script>
  <script nonce="${nonce}">
    const root = document.getElementById('root');
    if (root) {
      renderDump(root, ${safeXml});
    }
  </script>
</body>
</html>`;
}

function serializeForInlineScript(data: string): string {
  const ls = String.fromCharCode(0x2028);
  const ps = String.fromCharCode(0x2029);
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(ls).join('\\u2028')
    .split(ps).join('\\u2029');
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function deactivate() {}