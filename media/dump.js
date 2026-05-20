/* global renderDump */

let sortAttrs = false;
let rootContainer;
let rootXml;

function renderDump(container, xmlString) {
  rootContainer = container;
  rootXml = xmlString;
  renderRoot();
}

function renderRoot() {
  rootContainer.innerHTML = '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(rootXml, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const err = document.createElement('div');
    err.className = 'parse-error';
    err.textContent = parseError.textContent || 'XML parse error';
    rootContainer.appendChild(err);
    return;
  }

  rootContainer.appendChild(buildElement(doc.documentElement));
}

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg && msg.command === 'setSort') {
    sortAttrs = Boolean(msg.alpha);
    renderRoot();
  }
});

/**
 * Recursively build a DOM node for an XML element.
 * @param {Element} el
 * @returns {HTMLElement}
 */
function buildElement(el) {
  const attrs = Array.from(el.attributes);
  const childEls = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);

  // Simple leaf: no attributes, no child elements — render as a scalar string
  if (attrs.length === 0 && childEls.length === 0) {
    const trimmed = (el.textContent || '').trim();
    if (trimmed === '') {
      return scalar('(empty)', 'val-null');
    }
    return scalar(trimmed, 'val-string');
  }

  // Complex node: render as a table
  const sortedAttrs = sortAttrs
    ? [...attrs].sort((a, b) => a.name.localeCompare(b.name))
    : attrs;

  let headerLabel = '<' + el.localName + '>';
  const parts = [];
  if (attrs.length > 0) { parts.push(attrs.length + ' attr' + (attrs.length !== 1 ? 's' : '')); }
  if (childEls.length > 0) { parts.push(childEls.length + ' child' + (childEls.length !== 1 ? 'ren' : '')); }
  if (parts.length > 0) { headerLabel += '  —  ' + parts.join(', '); }

  const table = makeTable('type-element');
  const headerTh = makeHeaderRow(table, headerLabel);
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // Attribute rows (@ prefix, teal styling via CSS class)
  for (const attr of sortedAttrs) {
    const tr = document.createElement('tr');
    const tdKey = document.createElement('td');
    tdKey.className = 'attr-key';
    tdKey.textContent = '@' + attr.name;
    const tdVal = document.createElement('td');
    if (attr.value === '') {
      tdVal.appendChild(scalar('(empty string)', 'val-string val-string-empty'));
    } else {
      tdVal.appendChild(scalar(attr.value, 'val-attr'));
    }
    tr.appendChild(tdKey);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  }

  // Child element rows
  if (childEls.length > 0) {
    for (const child of childEls) {
      const tr = document.createElement('tr');
      const tdKey = document.createElement('td');
      tdKey.textContent = child.localName;
      const tdVal = document.createElement('td');
      const childNode = buildElement(/** @type {Element} */ (child));
      tdVal.appendChild(childNode);
      if (childNode instanceof HTMLTableElement) {
        wireKeyToggle(tdKey, childNode);
      }
      tr.appendChild(tdKey);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }
  } else {
    // Attrs-only element that also has text content: show it in a #text row
    const trimmed = (el.textContent || '').trim();
    if (trimmed !== '') {
      const tr = document.createElement('tr');
      const tdKey = document.createElement('td');
      tdKey.className = 'text-key';
      tdKey.textContent = '#text';
      const tdVal = document.createElement('td');
      tdVal.appendChild(scalar(trimmed, 'val-string'));
      tr.appendChild(tdKey);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }
  }

  // Guard: if tbody ended up empty, show (empty)
  if (tbody.children.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.className = 'dump-empty';
    td.textContent = '(empty)';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  wireToggle(headerTh, tbody);
  return table;
}

// ── Helpers ────────────────────────────────────────────────

function makeTable(typeClass) {
  const table = document.createElement('table');
  table.className = 'dump-table ' + typeClass;
  return table;
}

function makeHeaderRow(table, label) {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  th.className = 'dump-header';
  th.colSpan = 2;
  th.textContent = label;
  tr.appendChild(th);
  thead.appendChild(tr);
  table.appendChild(thead);
  return th;
}

function wireToggle(headerTh, tbody) {
  headerTh.addEventListener('click', () => {
    const collapsed = headerTh.classList.toggle('collapsed');
    tbody.style.display = collapsed ? 'none' : '';
  });
}

function wireKeyToggle(keyTd, childTable) {
  keyTd.style.cursor = 'pointer';
  keyTd.addEventListener('click', () => {
    const childHeader = childTable.querySelector('thead .dump-header');
    const childTbody = childTable.querySelector('tbody');
    if (childHeader && childTbody) {
      const collapsed = childHeader.classList.toggle('collapsed');
      childTbody.style.display = collapsed ? 'none' : '';
    }
  });
}

function scalar(text, cssClass) {
  const span = document.createElement('span');
  span.className = cssClass;
  span.textContent = text;
  return span;
}
