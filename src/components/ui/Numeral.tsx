/**
 * Wraps Bengali numeral output in a font stack whose digit glyphs are
 * clearly differentiated (Hind Siliguri's ১/৯ are nearly identical at small
 * sizes — see globals.css `--font-numeral`). Never wrap prose/mixed text
 * with this — only pure numeric/date/price output.
 */
export function Numeral({ children }: { children: React.ReactNode }) {
  return <span className="font-numeral">{children}</span>;
}
