import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let activePanel: vscode.WebviewPanel | undefined;

  const showDump = vscode.commands.registerCommand('xmlDump.showDump', async (uri?: vscode.Uri) => {
    const editor = vscode.window.activeTextEditor;
    const document = uri ? undefined : editor?.document;
    const targetUri = uri ?? document?.uri;

    if (!targetUri) {
      vscode.window.showErrorMessage('XML Dump: Open a .xml document first.');
      return;
    }

    if (!targetUri.path.toLowerCase().endsWith('.xml')) {
      vscode.window.showErrorMessage('XML Dump: Only .xml documents are supported.');
      return;
    }

    const panelTitle = `XML Dump: ${getFileName(targetUri)}`;

    let raw: string;
    if (document && document.uri.toString() === targetUri.toString()) {
      raw = document.getText();
    } else {
      try {
        raw = (await vscode.workspace.openTextDocument(targetUri)).getText();
      } catch {
        vscode.window.showErrorMessage('XML Dump: Could not read file.');
        return;
      }
    }

    let panel: vscode.WebviewPanel;
    try {
      panel = vscode.window.createWebviewPanel(
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
    } catch {
      vscode.window.showErrorMessage('XML Dump: Could not open the dump viewer.');
      return;
    }

    activePanel = panel;
    vscode.commands.executeCommand('setContext', 'xmlDump.isSortedAlpha', false);

    panel.onDidDispose(() => {
      if (activePanel === panel) {
        activePanel = undefined;
        vscode.commands.executeCommand('setContext', 'xmlDump.isSortedAlpha', false);
      }
    });
  });

  const sortAlpha = vscode.commands.registerCommand('xmlDump.sortAlpha', () => {
    vscode.commands.executeCommand('setContext', 'xmlDump.isSortedAlpha', true);
    activePanel?.webview.postMessage({ command: 'setSort', alpha: true });
  });

  const sortNatural = vscode.commands.registerCommand('xmlDump.sortNatural', () => {
    vscode.commands.executeCommand('setContext', 'xmlDump.isSortedAlpha', false);
    activePanel?.webview.postMessage({ command: 'setSort', alpha: false });
  });

  context.subscriptions.push(showDump, sortAlpha, sortNatural);
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

function getFileName(uri: vscode.Uri): string {
  const segments = uri.path.split('/');
  return segments[segments.length - 1] || uri.path;
}

export function deactivate() {}