// Helper: Parse markdown string into structured text and image sections
export const parseMarkdownToSections = (markdown) => {
  if (!markdown || !markdown.trim()) {
    return [{ id: 'sec-1', type: 'text', content: '' }];
  }

  const regex = /```interactive-map\s*([\w-]+)\s*```/g;
  const sections = [];
  let lastIndex = 0;
  let match;
  let counter = 0;

  while ((match = regex.exec(markdown)) !== null) {
    const textBefore = markdown.substring(lastIndex, match.index).trim();
    if (textBefore) {
      sections.push({
        id: `sec-txt-${++counter}`,
        type: 'text',
        content: textBefore
      });
    }
    sections.push({
      id: `sec-img-${++counter}`,
      type: 'image',
      mapId: match[1].trim()
    });
    lastIndex = regex.lastIndex;
  }

  const remainingText = markdown.substring(lastIndex).trim();
  if (remainingText || sections.length === 0) {
    sections.push({
      id: `sec-txt-${++counter}`,
      type: 'text',
      content: remainingText
    });
  }

  return sections;
};

// Helper: Serialize sections back to markdown string
export const sectionsToMarkdown = (sections) => {
  return sections
    .map((sec) => {
      if (sec.type === 'text') {
        return sec.content ? sec.content.trim() : '';
      } else if (sec.type === 'image') {
        return `\`\`\`interactive-map\n${sec.mapId}\n\`\`\``;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
};
