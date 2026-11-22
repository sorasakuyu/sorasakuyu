/**
 * 构建前自动给 diary 目录下的文章补密码。
 *
 * 规则：src/content/blog/diary/ 里任何一篇没有 password 字段的 md，
 * 都自动加上「locked-categories.ts 里「日记」对应的密码」。
 * 这样以后写新日记，只要丢进这个文件夹，构建时就会自动加密、自动不上首页。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIARY_DIR = path.join(ROOT, 'src/content/blog/diary');
const CONF = path.join(ROOT, 'src/lib/content/locked-categories.ts');
const CATEGORY = '日记';

function readPassword() {
  const src = fs.readFileSync(CONF, 'utf8');
  const re = new RegExp(`${CATEGORY}\\s*:\\s*['"]([^'"]+)['"]`);
  const m = src.match(re);
  if (!m) throw new Error(`在 locked-categories.ts 里找不到「${CATEGORY}」的密码`);
  return m[1];
}

if (!fs.existsSync(DIARY_DIR)) {
  console.log('[ensure-diary-password] 没有 diary 目录，跳过');
  process.exit(0);
}

const password = readPassword();
let touched = 0;

for (const name of fs.readdirSync(DIARY_DIR)) {
  if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
  const file = path.join(DIARY_DIR, name);
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---')) continue;

  const end = raw.indexOf('\n---', 3);
  if (end < 0) continue;

  const frontmatter = raw.slice(3, end);
  if (/^password:/m.test(frontmatter)) continue;

  const patched = `${frontmatter.replace(/\s*$/, '')}\npassword: ${password}\n`;
  fs.writeFileSync(file, `---${patched}${raw.slice(end)}`, 'utf8');
  touched += 1;
  console.log(`[ensure-diary-password] 已补密码：${name}`);
}

console.log(`[ensure-diary-password] 完成，补写 ${touched} 个文件`);
