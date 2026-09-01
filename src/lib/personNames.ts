const DATE_FRAGMENT = /\b\d{1,2}\/\d{1,2}(?:\s*\(\d+\))?\b/g;
const DATE_ONLY = /^\d{1,2}\/\d{1,2}(?:\s*\(\d+\))?$/;
const LOCATION_SUFFIX =
  /\s+(нячанг|дананг|фукуок|инст|inst)$/iu;

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Remove date fragments and return a person name, or null if nothing remains. */
export function cleanPersonName(raw: string): string | null {
  let name = raw.trim();
  if (!name || DATE_ONLY.test(name)) return null;

  name = name
    .replace(DATE_FRAGMENT, " ")
    .replace(/\(\d+\)/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  while (LOCATION_SUFFIX.test(name)) {
    name = name.replace(LOCATION_SUFFIX, "").trim();
  }

  if (!name || DATE_ONLY.test(name) || /^[\d\s/(),.-]+$/.test(name)) {
    return null;
  }

  return name;
}

function transliterateChar(char: string): string {
  const lower = char.toLowerCase();
  return CYRILLIC_TO_LATIN[lower] ?? lower;
}

function transliterateWord(word: string): string {
  const prepared = word
    .toLowerCase()
    .replace(/ья/g, "ia")
    .replace(/ия/g, "ia");

  return prepared
    .split("")
    .map((char) => transliterateChar(char))
    .join("");
}

function personNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\/\s*/g, "/")
    .split(/[\s/]+/)
    .map((part) => transliterateWord(part))
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

function nameQuality(name: string, fromUser: boolean): number {
  let score = fromUser ? 1_000 : 0;
  if (!/\d/.test(name)) score += 20;
  if (/^[A-ZА-ЯЁ][a-zа-яё]+(\s+[A-ZА-ЯЁ][a-zа-яё]+)*$/u.test(name)) {
    score += 10;
  }
  if (/^[A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 .()/]*$/u.test(name)) score += 5;
  score += Math.min(name.length, 50);
  return score;
}

export function uniquePersonNames(
  sources: { name: string; fromUser?: boolean }[],
): string[] {
  const byKey = new Map<string, { name: string; score: number }>();

  for (const { name: raw, fromUser = false } of sources) {
    const cleaned = cleanPersonName(raw);
    if (!cleaned) continue;

    const key = personNameKey(cleaned);
    if (!key) continue;

    const score = nameQuality(cleaned, fromUser);
    const existing = byKey.get(key);

    if (!existing || score > existing.score) {
      byKey.set(key, { name: cleaned, score });
    }
  }

  return [...byKey.values()]
    .map(({ name }) => name)
    .sort((a, b) => a.localeCompare(b, "ru"));
}

/** Match a stored value to the canonical option from a cleaned list. */
export function matchPersonName(
  raw: string | null | undefined,
  options: string[],
): string {
  if (!raw) return "";
  const cleaned = cleanPersonName(raw);
  if (!cleaned) return "";

  const key = personNameKey(cleaned);
  return options.find((option) => personNameKey(option) === key) ?? cleaned;
}
