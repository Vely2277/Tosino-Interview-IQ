//For formatting
// @ts-ignore
import { marked } from "marked";

export function renderMarkdownToHTML(markdown: string): string {
  return marked.parse(markdown);
}
