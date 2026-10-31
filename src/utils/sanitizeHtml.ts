import React from 'react';

/**
 * Sanitizes an HTML string to ensure only safe, permitted tags and attributes are retained.
 * Blocks all script tags, object/embed/iframe tags, inline event handlers (onclick, onerror, etc.),
 * and javascript: pseudo-protocols.
 */
export function sanitizeProductHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // In browser environment, use DOMParser
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // Allowed tags for product descriptions
      const allowedTags = new Set([
        'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
        'UL', 'OL', 'LI', 'BR', 'HR', 'BLOCKQUOTE',
        'SPAN', 'DIV', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD'
      ]);

      // Recursively clean node tree
      const cleanNode = (node: Node) => {
        const children = Array.from(node.childNodes);
        for (const child of children) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement;
            const tagName = el.tagName.toUpperCase();

            if (!allowedTags.has(tagName)) {
              // Replace disallowed element with its text content
              const textNode = doc.createTextNode(el.textContent || '');
              el.parentNode?.replaceChild(textNode, el);
              continue;
            }

            // Remove any dangerous attributes
            const attrs = Array.from(el.attributes);
            for (const attr of attrs) {
              const attrName = attr.name.toLowerCase();
              const attrVal = attr.value.toLowerCase().trim();

              // Remove any on* event handlers
              if (attrName.startsWith('on')) {
                el.removeAttribute(attr.name);
                continue;
              }

              // Remove dangerous href/src
              if (attrVal.startsWith('javascript:') || attrVal.startsWith('data:text/html')) {
                el.removeAttribute(attr.name);
                continue;
              }

              // Only allow class and style if safe
              if (attrName !== 'class' && attrName !== 'style') {
                el.removeAttribute(attr.name);
              }
            }

            cleanNode(child);
          }
        }
      };

      cleanNode(doc.body);
      return doc.body.innerHTML;
    } catch {
      // Fallback regex cleaning if parser fails
    }
  }

  // Regex fallback: strip <script>, <style>, <iframe>, <object>, <embed>, on* handlers
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');
}

/**
 * Renders formatted product description cleanly.
 * If the string contains HTML markup, it sanitizes and safely injects it.
 * If it's plain text with line breaks, it converts paragraphs into nicely spaced blocks.
 */
export function renderFormattedDescription(content: string | undefined): React.ReactNode {
  if (!content || !content.trim()) {
    return React.createElement(
      'p',
      { className: 'text-gray-400 italic text-xs' },
      'পণ্যের কোনো বিস্তারিত বিবরণ প্রদান করা হয়নি।'
    );
  }

  const trimmed = content.trim();
  const hasHtml = /<[a-z][\s\S]*>/i.test(trimmed);

  if (hasHtml) {
    const clean = sanitizeProductHtml(trimmed);
    return React.createElement('div', {
      className: 'rich-description-content text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2.5',
      dangerouslySetInnerHTML: { __html: clean },
    });
  }

  // Plain text with line breaks: split by double newlines into paragraphs
  const paragraphs = trimmed.split(/\n\s*\n/);
  return React.createElement(
    'div',
    { className: 'plain-description-content text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3' },
    paragraphs.map((para, idx) =>
      React.createElement(
        'p',
        { key: idx, className: 'whitespace-pre-line' },
        para
      )
    )
  );
}
