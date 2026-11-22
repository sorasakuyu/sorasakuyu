/**
 * 需要密码才能查看的分区。
 *
 * 分类名 -> 密码，只在本文件里出现。
 * 密码在构建时用来加密"该分区的文章列表"和每篇文章正文，
 * 最终 HTML 里只有密文，不会出现明文密码和明文内容。
 *
 * 想给别的分区也上锁，往这里加一行就行。
 */
export const LOCKED_CATEGORIES: Record<string, string> = {
  日记: 'azumi_diary',
};

export function getCategoryPassword(name?: string | null): string | null {
  if (!name) return null;
  return LOCKED_CATEGORIES[name] ?? null;
}

export function isLockedCategory(name?: string | null): boolean {
  return getCategoryPassword(name) !== null;
}
