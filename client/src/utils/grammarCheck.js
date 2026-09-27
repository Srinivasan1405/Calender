const COMMON_MISTAKES = [
  { pattern: /\bthey're\b/gi, correction: 'they\'re (they are)', context: 'they are' },
  { pattern: /\byoure\b/gi, correction: "you're (you are)", context: 'you are' },
  { pattern: /\bits a\b/gi, correction: "it's a (it is a)", context: "it's" },
  { pattern: /\bdont\b/gi, correction: "don't", context: "don't" },
  { pattern: /\bdoesnt\b/gi, correction: "doesn't", context: "doesn't" },
  { pattern: /\bwont\b/gi, correction: "won't", context: "won't" },
  { pattern: /\bcant\b/gi, correction: "can't", context: "can't" },
  { pattern: /\bwasnt\b/gi, correction: "wasn't", context: "wasn't" },
  { pattern: /\bwouldnt\b/gi, correction: "wouldn't", context: "wouldn't" },
  { pattern: /\bcouldnt\b/gi, correction: "couldn't", context: "couldn't" },
  { pattern: /\bshouldnt\b/gi, correction: "shouldn't", context: "shouldn't" },
  { pattern: /\bive\b/gi, correction: "I've", context: 'I have' },
  { pattern: /\bim\b/gi, correction: "I'm", context: 'I am' },
  { pattern: /\bisnt\b/gi, correction: "isn't", context: "isn't" },
  { pattern: /\barent\b/gi, correction: "aren't", context: "aren't" },
  { pattern: /\bhavent\b/gi, correction: "haven't", context: "haven't" },
  { pattern: /\bdidnt\b/gi, correction: "didn't", context: "didn't" },
  { pattern: /\bdoesnt\b/gi, correction: "doesn't", context: "doesn't" },
];

const HOMOPHONE_RULES = [
  {
    pattern: /\byour\b(?!\s+(own|name|life|time|way|turn|best|worst|first|last|eyes|hands|feet|head|mind|heart|soul|work|home|family|friend|friends|day|night|money|job|car|house|book|phone|computer|health|body|choice|fault|loss|gain|word|words|ideas|thoughts|feelings|goals|plans|dreams|hopes|fears|strength|weakness|problems|solutions|questions|answers|rights|duties|responsibilities|obligations|actions|behaviors|habits|routines|tasks|projects|assignments|meetings|appointments|events|schedules|deadlines|priorities|values|principles|standards|boundaries|limits|rules|policies|procedures|processes|systems|methods|strategies|tactics|techniques|tools|resources|assets|skills|talents|abilities|qualities|traits|characteristics|features|benefits|advantages|disadvantages|drawbacks|risks|rewards|outcomes|results|impacts|effects|consequences|implications|meanings|significances|purposes|functions|roles|positions|statuses|conditions|states|forms|types|kinds|sorts|categories|classes|groups|sets)\b)/gi,
    correction: "you're (you are) or your (possessive)",
    hint: 'Did you mean "you\'re" (you are) or "your" (belonging to you)?'
  },
  {
    pattern: /\btheir\b(?=\s+(going|doing|making|taking|giving|having|being|coming|going|leaving|arriving|starting|finishing|working|playing|eating|drinking|sleeping|running|walking|talking|speaking|listening|reading|writing|thinking|feeling|knowing|understanding|learning|teaching|helping|supporting|joining|leading|managing|creating|building|growing|achieving|accomplishing|completing|finishing|starting|beginning|continuing|stopping|pausing|ending))/gi,
    correction: "they're (they are)",
    hint: 'Did you mean "they\'re" (they are)?'
  },
  {
    pattern: /\bthere\b(?=\s+(going|doing|making|taking|giving|having|being|coming|going|leaving|arriving))/gi,
    correction: "they're (they are) or there (place)",
    hint: 'Did you mean "they\'re" (they are) or "there" (that place)?'
  },
  {
    pattern: /\bits\b(?!\s+(own|name|life|time|way|purpose|function|role|position|status|condition|state|form|type|kind|color|size|shape|weight|height|depth|width|length|age|value|price|cost|quality|quantity|capacity|volume|area|location|position|direction|origin|source|cause|effect|result|impact|benefit|drawback|feature|characteristic|property|attribute|quality|aspect|element|component|part|piece|section|segment|portion|fraction|percentage|ratio|rate|frequency|duration|interval|period|phase|stage|level|degree|extent|range|scope|limit|boundary|edge|border|margin|gap|space|distance)\b)/gi,
    correction: "it's (it is) or its (possessive)",
    hint: 'Did you mean "it\'s" (it is) or "its" (belonging to it)?'
  },
  {
    pattern: /\b(loose|lose)\b/gi,
    correction: "loose (not tight) or lose (misplace)",
    hint: '"Lose" is the opposite of win; "loose" means not tight.'
  },
  {
    pattern: /\b(than|then)\b/gi,
    correction: "than (comparison) or then (time)",
    hint: '"Than" is for comparisons; "then" is for time/sequence.'
  },
  {
    pattern: /\b(alot|a lot)\b/gi,
    correction: "a lot (two words)",
    hint: '"A lot" is two words, not "alot".'
  },
  {
    pattern: /\bcould of\b/gi,
    correction: "could have",
    hint: 'Use "could have" instead of "could of".'
  },
  {
    pattern: /\bshould of\b/gi,
    correction: "should have",
    hint: 'Use "should have" instead of "should of".'
  },
  {
    pattern: /\bwould of\b/gi,
    correction: "would have",
    hint: 'Use "would have" instead of "would of".'
  },
  {
    pattern: /\bmight of\b/gi,
    correction: "might have",
    hint: 'Use "might have" instead of "might of".'
  },
  {
    pattern: /\bmust of\b/gi,
    correction: "must have",
    hint: 'Use "must have" instead of "must of".'
  },
];

const CAPITALIZATION_RULES = [
  {
    pattern: /\bi\b/g,
    correction: "I",
    hint: 'Always capitalize "I" when referring to yourself.'
  },
  {
    pattern: /^[a-z]/,
    correction: "Capitalize first letter",
    hint: 'Start sentences with a capital letter.'
  },
];

export function checkGrammar(text) {
  if (!text || typeof text !== 'string') return [];

  const suggestions = [];

  for (const rule of COMMON_MISTAKES) {
    rule.pattern.lastIndex = 0;
    const match = rule.pattern.exec(text);
    if (match) {
      suggestions.push({
        word: match[0],
        correction: rule.correction,
        index: match.index,
      });
    }
  }

  for (const rule of HOMOPHONE_RULES) {
    rule.pattern.lastIndex = 0;
    const match = rule.pattern.exec(text);
    if (match) {
      suggestions.push({
        word: match[0],
        correction: rule.correction,
        hint: rule.hint,
        index: match.index,
      });
    }
  }

  for (const rule of CAPITALIZATION_RULES) {
    rule.pattern.lastIndex = 0;
    const match = rule.pattern.exec(text);
    if (match) {
      suggestions.push({
        word: match[0],
        correction: rule.correction,
        hint: rule.hint,
        index: match.index,
      });
    }
  }

  return suggestions;
}

export function GrammarSuggestions({ text, onSuggestionClick }) {
  const suggestions = checkGrammar(text);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {suggestions.slice(0, 3).map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors"
          onClick={() => onSuggestionClick && onSuggestionClick(s)}
          title={s.hint || ''}
        >
          <span>💡</span>
          <span>
            "<span className="font-semibold underline decoration-dotted">{s.word}</span>" → {s.correction}
          </span>
        </div>
      ))}
    </div>
  );
}
