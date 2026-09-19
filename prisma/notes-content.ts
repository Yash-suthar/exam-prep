import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type NoteSection = {
  heading: string;
  lines: string[];
};

export type NoteDoc = {
  slug: string;
  title: string;
  subtitle: string;
  sections: NoteSection[];
};

/** pdf-lib's standard fonts are WinAnsi only, so strip anything outside it. */
function winAnsi(value: string) {
  return value
    .replace(/[₹]/g, "Rs ")
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[×]/g, "x")
    .replace(/[÷]/g, "/")
    .replace(/[≈]/g, "~")
    .replace(/[°]/g, " deg")
    .replace(/[^\x20-\x7E]/g, "-");
}

function wrap(text: string, max: number) {
  const words = winAnsi(text).split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export async function writeNotesPdf(filePath: string, doc: NoteDoc) {
  const pdf = await PDFDocument.create();
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const teal = rgb(0.06, 0.46, 0.43);

  let y = 0;

  // Cover page carries the title block; continuation pages get a slim header.
  let page = pdf.addPage([595, 842]);
  page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: teal });
  page.drawText(winAnsi("MeritPath"), {
    x: 48,
    y: 800,
    size: 12,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(winAnsi(doc.title), {
    x: 48,
    y: 768,
    size: 20,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(winAnsi(doc.subtitle), {
    x: 48,
    y: 714,
    size: 11,
    font: body,
    color: rgb(0.35, 0.33, 0.3),
  });
  y = 682;

  const newPage = () => {
    page = pdf.addPage([595, 842]);
    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: teal });
    page.drawText(winAnsi("MeritPath study notes"), {
      x: 48,
      y: 812,
      size: 11,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(winAnsi(doc.title), {
      x: 48,
      y: 760,
      size: 15,
      font: bold,
    });
    y = 734;
  };

  const ensure = (needed: number) => {
    if (y - needed < 60) newPage();
  };

  for (const section of doc.sections) {
    ensure(70);
    page.drawText(winAnsi(section.heading), {
      x: 48,
      y,
      size: 13,
      font: bold,
      color: teal,
    });
    y -= 6;
    page.drawLine({
      start: { x: 48, y },
      end: { x: 547, y },
      thickness: 0.7,
      color: rgb(0.85, 0.82, 0.78),
    });
    y -= 18;

    for (const line of section.lines) {
      const isBullet = !line.startsWith("#");
      const text = isBullet ? line : line.slice(1).trim();
      const chunks = wrap(text, 88);
      ensure(chunks.length * 15 + 8);
      chunks.forEach((chunk, index) => {
        if (isBullet && index === 0) {
          page.drawText("-", { x: 52, y, size: 10, font: body });
        }
        page.drawText(chunk, {
          x: isBullet ? 64 : 52,
          y,
          size: 10,
          font: isBullet ? body : bold,
        });
        y -= 15;
      });
      y -= 3;
    }
    y -= 12;
  }

  const total = pdf.getPageCount();
  pdf.getPages().forEach((current, index) => {
    current.drawText(winAnsi(`MeritPath - ${doc.title}`), {
      x: 48,
      y: 34,
      size: 8,
      font: body,
      color: rgb(0.55, 0.52, 0.48),
    });
    current.drawText(`${index + 1} / ${total}`, {
      x: 520,
      y: 34,
      size: 8,
      font: body,
      color: rgb(0.55, 0.52, 0.48),
    });
  });

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, await pdf.save());
}

export const NOTE_DOCS: NoteDoc[] = [
  {
    slug: "arithmetic-ssc-notes",
    title: "Arithmetic for SSC - Class Notes",
    subtitle: "Quantitative Aptitude · percentages, ratio, interest, time and work",
    sections: [
      {
        heading: "1. Percentages",
        lines: [
          "#Core idea",
          "A percentage is a fraction with denominator 100. x% of N = N * x / 100.",
          "Learn the fraction table: 1/2 = 50%, 1/3 = 33.33%, 1/4 = 25%, 1/5 = 20%, 1/6 = 16.66%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%.",
          "#Successive change",
          "If a value rises a% then b%, net change = a + b + (ab/100).",
          "A 20% rise followed by a 20% fall gives 20 - 20 - 400/100 = -4%, a net loss.",
          "#Worked example",
          "15% of x = 45. Then x = 45 * 100 / 15 = 300.",
        ],
      },
      {
        heading: "2. Ratio and proportion",
        lines: [
          "a : b = c : d means ad = bc. Cross multiply before you simplify.",
          "If a : b = 2 : 3 and b : c = 4 : 5, make b common: a : b : c = 8 : 12 : 15.",
          "Dividing Rs 1,200 in 2 : 3 gives 1200 * 2/5 = Rs 480 and 1200 * 3/5 = Rs 720.",
        ],
      },
      {
        heading: "3. Simple and compound interest",
        lines: [
          "#Formulas",
          "SI = P * R * T / 100.",
          "CI amount = P * (1 + R/100)^T, so CI = amount - P.",
          "For 2 years, CI - SI = P * (R/100)^2.",
          "#Worked example",
          "SI on Rs 4,000 at 5% for 3 years = 4000 * 5 * 3 / 100 = Rs 600.",
        ],
      },
      {
        heading: "4. Time, speed and distance",
        lines: [
          "Speed = distance / time. To convert km/h to m/s multiply by 5/18.",
          "A train 120 m long passing a pole in 6 s moves at 20 m/s = 72 km/h.",
          "When a train crosses a platform, distance = train length + platform length.",
        ],
      },
      {
        heading: "5. Time and work",
        lines: [
          "Treat work as 1 unit. A finishes in a days, so A does 1/a per day.",
          "Together: 1/a + 1/b = (a + b) / ab, so time = ab / (a + b).",
          "A in 10 days and B in 15 days finish together in 150/25 = 6 days.",
          "Use LCM units: total work 30, A does 3/day, B does 2/day, together 5/day.",
        ],
      },
      {
        heading: "6. Averages",
        lines: [
          "Average = sum of terms / number of terms.",
          "Average of 12, 18, 24 = 54 / 3 = 18.",
          "Average of the first n natural numbers = (n + 1) / 2.",
          "If one value changes, the average shifts by change / count.",
        ],
      },
      {
        heading: "Practice set",
        lines: [
          "1. 20% of 250 is what number?",
          "2. Divide Rs 3,500 between two people in the ratio 3 : 4.",
          "3. Find SI on Rs 7,200 at 8% for 2.5 years.",
          "4. A does a job in 12 days and B in 18. How long together?",
          "5. The average of five numbers is 24. Four of them total 88. Find the fifth.",
          "#Answers",
          "50 | Rs 1,500 and Rs 2,000 | Rs 1,440 | 7.2 days | 32",
        ],
      },
    ],
  },
  {
    slug: "puzzle-workbook",
    title: "Puzzle Workbook",
    subtitle: "Reasoning · seating, floors, scheduling and blood relations",
    sections: [
      {
        heading: "How to attack a puzzle",
        lines: [
          "Read every statement once before you draw anything.",
          "Separate definite clues from conditional ones. Place definite clues first.",
          "Draw the frame: a line for rows, a ladder for floors, a circle for round tables.",
          "For circular arrangements, fix one person and place the rest relative to them.",
          "If two cases survive, carry both and eliminate with the last clue.",
        ],
      },
      {
        heading: "Floor puzzles",
        lines: [
          "Number floors bottom to top. 'Above' does not mean 'immediately above'.",
          "'Exactly two people between A and B' gives a gap of three floors.",
          "Count possible positions before you commit to a case.",
        ],
      },
      {
        heading: "Blood relations",
        lines: [
          "Use + for male, - for female, and a double line for a married pair.",
          "Work backwards from the person asked about.",
          "'My father's only son' is the speaker himself, a common trap.",
        ],
      },
      {
        heading: "Practice puzzle",
        lines: [
          "Five friends P, Q, R, S, T sit in a row facing north.",
          "R sits third from the left. Q sits immediately right of P.",
          "T is at one of the ends. S is not next to R.",
          "#Answer",
          "P Q R T S is invalid because T must be at an end; the order is S P Q R T only if S is not next to R, which holds. Final: S P Q R T.",
        ],
      },
    ],
  },
  {
    slug: "error-spotting-pack",
    title: "Error Spotting Pack",
    subtitle: "English · the grammar rules that decide SSC error questions",
    sections: [
      {
        heading: "Subject-verb agreement",
        lines: [
          "A singular subject takes a singular verb even when a phrase separates them.",
          "'The list of items is on the table' - the subject is 'list', not 'items'.",
          "Either / neither with 'or' agrees with the nearer subject.",
          "Collective nouns take a singular verb when the group acts as one.",
        ],
      },
      {
        heading: "Articles",
        lines: [
          "Use 'a' before a consonant sound and 'an' before a vowel sound: a university, an hour.",
          "'The' goes before rivers, oceans, mountain ranges and superlatives.",
          "No article before a proper noun, a meal or an abstract idea in general use.",
        ],
      },
      {
        heading: "Prepositions that trap",
        lines: [
          "Different from, superior to, married to, comply with, discuss (no 'about').",
          "Since is used with a point of time, for with a period.",
          "Between is for two, among is for more than two.",
        ],
      },
      {
        heading: "Common confusions",
        lines: [
          "Its (possessive) and it's (it is).",
          "Affect is the verb, effect is the noun.",
          "Fewer counts items, less measures quantity.",
          "Accommodate has two c's and two m's.",
        ],
      },
      {
        heading: "Spot the error",
        lines: [
          "1. (a) One of the boys / (b) have been / (c) selected / (d) no error",
          "2. (a) He is senior / (b) than me / (c) by two years / (d) no error",
          "#Answers",
          "1 - (b), it should be 'has been'. 2 - (b), it should be 'senior to me'.",
        ],
      },
    ],
  },
  {
    slug: "polity-capsules",
    title: "Polity Capsules",
    subtitle: "General Studies · Constitution, Parliament and the judiciary",
    sections: [
      {
        heading: "Making of the Constitution",
        lines: [
          "The Constituent Assembly first met on 9 December 1946.",
          "Dr B R Ambedkar chaired the Drafting Committee.",
          "The Constitution was adopted on 26 November 1949 and came into force on 26 January 1950.",
        ],
      },
      {
        heading: "Parliament",
        lines: [
          "Parliament is the President, the Lok Sabha and the Rajya Sabha.",
          "The Vice-President is the ex-officio Chairman of the Rajya Sabha.",
          "The Lok Sabha has a five-year term; the Rajya Sabha is permanent with a third retiring every two years.",
          "A money bill can start only in the Lok Sabha.",
        ],
      },
      {
        heading: "Fundamental rights",
        lines: [
          "Article 14 - equality before the law.",
          "Articles 19 to 22 - freedom and protection in respect of conviction.",
          "Article 21 - protection of life and personal liberty.",
          "Article 32 - the right to constitutional remedies, called the heart of the Constitution.",
        ],
      },
      {
        heading: "Quick revision",
        lines: [
          "Who administers the oath to the President? The Chief Justice of India.",
          "Minimum age for the Lok Sabha? 25 years. For the Rajya Sabha? 30 years.",
          "Which schedule deals with anti-defection? The Tenth.",
        ],
      },
    ],
  },
  {
    slug: "ncert-physics-12",
    title: "NCERT Physics 12 - Fast notes",
    subtitle: "JEE and boards · electrostatics, current and optics",
    sections: [
      {
        heading: "Electrostatics",
        lines: [
          "Coulomb's law: F = k q1 q2 / r^2 with k = 9 x 10^9 N m^2 / C^2.",
          "Electric field of a point charge: E = k q / r^2, directed away from a positive charge.",
          "Potential: V = k q / r. Potential is a scalar, field is a vector.",
          "Capacitance of a parallel plate capacitor: C = e0 A / d.",
        ],
      },
      {
        heading: "Current electricity",
        lines: [
          "Ohm's law: V = I R. Resistance R = rho L / A.",
          "Series: R = R1 + R2. Parallel: 1/R = 1/R1 + 1/R2.",
          "Power dissipated: P = V I = I^2 R = V^2 / R.",
          "Kirchhoff: current in equals current out; the sum of EMFs around a loop is zero.",
        ],
      },
      {
        heading: "Optics",
        lines: [
          "Mirror formula: 1/v + 1/u = 1/f. Lens formula: 1/v - 1/u = 1/f.",
          "Magnification for a lens: m = v / u.",
          "Snell's law: n1 sin i = n2 sin r.",
          "Critical angle: sin C = 1 / n for light leaving a denser medium.",
        ],
      },
      {
        heading: "Modern physics",
        lines: [
          "Photon energy: E = h f = h c / lambda.",
          "Photoelectric equation: K max = h f - work function.",
          "de Broglie wavelength: lambda = h / p.",
        ],
      },
    ],
  },
  {
    slug: "organic-chemistry-drill",
    title: "Organic Chemistry Drill",
    subtitle: "NEET · nomenclature, isomerism and named reactions",
    sections: [
      {
        heading: "Naming rules",
        lines: [
          "Pick the longest chain containing the principal functional group.",
          "Number so the principal group gets the lowest locant.",
          "Priority order: carboxylic acid, ester, amide, aldehyde, ketone, alcohol, amine.",
        ],
      },
      {
        heading: "Isomerism",
        lines: [
          "Structural isomers differ in connectivity: chain, position and functional.",
          "Stereoisomers share connectivity but differ in arrangement: geometrical and optical.",
          "A carbon with four different groups is a chiral centre.",
        ],
      },
      {
        heading: "Named reactions to memorise",
        lines: [
          "Aldol condensation - two carbonyls with alpha hydrogen, base catalysed.",
          "Cannizzaro - aldehydes with no alpha hydrogen disproportionate.",
          "Friedel-Crafts alkylation and acylation with anhydrous AlCl3.",
          "Hofmann bromamide gives a primary amine with one carbon fewer.",
        ],
      },
      {
        heading: "Tests you must know",
        lines: [
          "Tollens reagent gives a silver mirror with aldehydes.",
          "Fehling solution gives a red precipitate with aliphatic aldehydes.",
          "Iodoform test is positive for methyl ketones and ethanol.",
        ],
      },
    ],
  },
  {
    slug: "board-maths-12",
    title: "Board Maths 12 - Target 90",
    subtitle: "Class 12 · calculus, vectors and probability",
    sections: [
      {
        heading: "Differentiation",
        lines: [
          "Product rule: (uv)' = u'v + uv'.",
          "Quotient rule: (u/v)' = (u'v - uv') / v^2.",
          "Chain rule: dy/dx = dy/du * du/dx.",
          "d/dx of sin x is cos x; of e^x is e^x; of ln x is 1/x.",
        ],
      },
      {
        heading: "Integration",
        lines: [
          "Integral of x^n = x^(n+1) / (n+1) for n not equal to -1.",
          "Integration by parts: integral of u dv = uv - integral of v du. Use ILATE to pick u.",
          "Definite integrals: apply limits after integrating, upper minus lower.",
        ],
      },
      {
        heading: "Vectors and 3D",
        lines: [
          "Dot product a.b = |a||b| cos theta gives a scalar.",
          "Cross product a x b has magnitude |a||b| sin theta and is perpendicular to both.",
          "Two vectors are perpendicular when the dot product is zero.",
        ],
      },
      {
        heading: "Probability",
        lines: [
          "P(A or B) = P(A) + P(B) - P(A and B).",
          "Conditional probability: P(A|B) = P(A and B) / P(B).",
          "Bayes theorem reverses the condition; write the tree before substituting.",
        ],
      },
    ],
  },
  {
    slug: "banking-di-workbook",
    title: "Banking DI Workbook",
    subtitle: "IBPS and SBI · data interpretation under time pressure",
    sections: [
      {
        heading: "Before you calculate",
        lines: [
          "Read the units in the caption. Lakhs and crores decide half the errors.",
          "Scan the question set and answer the direct reads first.",
          "Approximate when options are far apart; compute exactly only when they are close.",
        ],
      },
      {
        heading: "Speed techniques",
        lines: [
          "Percentage change = (new - old) / old x 100. Keep the old value in the denominator.",
          "For ratios, cancel common factors before dividing.",
          "Learn squares to 30 and cubes to 15 so estimation is instant.",
        ],
      },
      {
        heading: "Chart types",
        lines: [
          "Tables reward careful reading, not cleverness.",
          "Pie charts: convert degrees to percentage by dividing by 3.6.",
          "Line graphs: look for the steepest segment when asked about maximum change.",
          "Caselets: build your own small table before answering.",
        ],
      },
      {
        heading: "Practice",
        lines: [
          "A branch disbursed 240, 300, 270 and 330 loans over four quarters.",
          "1. What is the average per quarter?",
          "2. What is the percentage rise from Q1 to Q4?",
          "#Answers",
          "1 - 285. 2 - (330 - 240) / 240 x 100 = 37.5%.",
        ],
      },
    ],
  },
  {
    slug: "number-system-one-pager",
    title: "Number System one-pager",
    subtitle: "Quant · divisibility, remainders, HCF and LCM",
    sections: [
      {
        heading: "Divisibility rules",
        lines: [
          "By 3: the digit sum is divisible by 3. By 9: the digit sum is divisible by 9.",
          "By 4: the last two digits form a multiple of 4. By 8: the last three digits do.",
          "By 11: the difference of alternating digit sums is 0 or a multiple of 11.",
        ],
      },
      {
        heading: "HCF and LCM",
        lines: [
          "HCF x LCM = product of the two numbers.",
          "LCM of 12 and 18: 12 = 2^2 x 3, 18 = 2 x 3^2, LCM = 2^2 x 3^2 = 36.",
          "HCF of the same pair = 2 x 3 = 6. Check: 36 x 6 = 216 = 12 x 18.",
        ],
      },
      {
        heading: "Remainders",
        lines: [
          "Dividend = divisor x quotient + remainder.",
          "The remainder is always less than the divisor.",
          "For powers, look for a repeating cycle in the last digit.",
        ],
      },
    ],
  },
  {
    slug: "syllogism-maps",
    title: "Syllogism maps",
    subtitle: "Reasoning · Venn diagrams for all and some statements",
    sections: [
      {
        heading: "The four statement types",
        lines: [
          "All A are B - circle A sits inside circle B.",
          "No A is B - two separate circles.",
          "Some A are B - two overlapping circles.",
          "Some A are not B - part of A lies outside B.",
        ],
      },
      {
        heading: "Rules that never fail",
        lines: [
          "A conclusion must follow in every possible diagram, not just one.",
          "Two particular statements give no definite conclusion.",
          "Two negative statements give no definite conclusion.",
          "'All A are B' never means 'All B are A'.",
        ],
      },
      {
        heading: "Possibility questions",
        lines: [
          "For 'possibility' conclusions, ask whether one valid diagram exists.",
          "For definite conclusions, ask whether a counter diagram exists.",
        ],
      },
    ],
  },
  {
    slug: "current-affairs-90-days",
    title: "Current affairs - last 90 days",
    subtitle: "General awareness · how to revise, not just read",
    sections: [
      {
        heading: "How to use this file",
        lines: [
          "Current affairs age quickly. Treat the structure below as your revision template and fill it weekly from a newspaper.",
          "Keep one page per month. Revise the same page three times instead of reading three sources once.",
        ],
      },
      {
        heading: "Sections to maintain",
        lines: [
          "National schemes - name, ministry, launch date, target group.",
          "Appointments - post, person, predecessor.",
          "Awards - award, winner, field.",
          "Sports - tournament, winner, venue.",
          "Economy - repo rate, inflation print, GDP estimate.",
          "Summits - name, host country, theme.",
        ],
      },
      {
        heading: "Standing facts worth knowing",
        lines: [
          "The RBI sets the repo rate through the Monetary Policy Committee.",
          "GST is a tax on value addition, collected at each stage with input credit.",
          "The Finance Commission is constituted every five years under Article 280.",
        ],
      },
    ],
  },
  {
    slug: "percentages-speed-sheet",
    title: "Percentages speed sheet",
    subtitle: "Quant · the conversions you should never compute",
    sections: [
      {
        heading: "Fraction to percentage",
        lines: [
          "1/2 = 50%, 1/3 = 33.33%, 1/4 = 25%, 1/5 = 20%, 1/6 = 16.67%.",
          "1/7 = 14.29%, 1/8 = 12.5%, 1/9 = 11.11%, 1/10 = 10%, 1/11 = 9.09%.",
          "1/12 = 8.33%, 1/15 = 6.67%, 1/16 = 6.25%, 1/20 = 5%, 1/25 = 4%.",
        ],
      },
      {
        heading: "Shortcuts",
        lines: [
          "Increasing by 25% means multiplying by 5/4. Decreasing by 20% means multiplying by 4/5.",
          "To find 15% of a number, take 10% and add half of it.",
          "x% of y always equals y% of x. 18% of 50 = 50% of 18 = 9.",
        ],
      },
      {
        heading: "Profit and loss link",
        lines: [
          "Profit % = profit / cost price x 100. The base is always cost price.",
          "Two successive 10% discounts give 19%, not 20%.",
        ],
      },
    ],
  },
  {
    slug: "vocabulary-candid-to-scarce",
    title: "Vocabulary - candid to scarce",
    subtitle: "English · high frequency words with synonyms and antonyms",
    sections: [
      {
        heading: "Word list",
        lines: [
          "Candid - frank, open. Antonym: guarded.",
          "Scarce - in short supply. Antonym: abundant.",
          "Prudent - careful and sensible. Antonym: reckless.",
          "Lucid - clear and easy to follow. Antonym: obscure.",
          "Obsolete - out of date. Antonym: current.",
          "Abridge - to shorten. Antonym: expand.",
          "Benevolent - kind and generous. Antonym: malevolent.",
          "Tenacious - holding firmly. Antonym: yielding.",
          "Frugal - careful with money. Antonym: extravagant.",
          "Vindicate - to clear of blame. Antonym: accuse.",
        ],
      },
      {
        heading: "How to revise",
        lines: [
          "Learn words in pairs with their antonyms; recall doubles.",
          "Write one sentence of your own per word. Recognition is not enough for fill in the blanks.",
          "Revisit the list after one day, one week and one month.",
        ],
      },
    ],
  },
  {
    slug: "neet-biology-kidneys-lungs",
    title: "NEET Biology - kidneys and lungs",
    subtitle: "Human physiology · excretion and breathing",
    sections: [
      {
        heading: "Excretory system",
        lines: [
          "The kidney is the organ that filters blood and forms urine.",
          "The nephron is the functional unit; each kidney has about one million.",
          "Filtration happens in the glomerulus, reabsorption mainly in the proximal tubule.",
          "ADH increases water reabsorption in the collecting duct and concentrates urine.",
        ],
      },
      {
        heading: "Respiratory system",
        lines: [
          "Gas exchange occurs across the alveoli by simple diffusion.",
          "Oxygen is carried mostly as oxyhaemoglobin; carbon dioxide mostly as bicarbonate.",
          "Inspiration is active: the diaphragm contracts and flattens.",
          "Tidal volume is about 500 mL; vital capacity is about 4,500 mL in an adult.",
        ],
      },
      {
        heading: "Frequently asked",
        lines: [
          "Which organ purifies blood? The kidneys.",
          "Where does counter current exchange occur? The loop of Henle and vasa recta.",
          "What shifts the oxygen dissociation curve right? More CO2, lower pH, higher temperature.",
        ],
      },
    ],
  },
  {
    slug: "jee-kinematics-flash",
    title: "JEE kinematics flash",
    subtitle: "Physics · motion in one and two dimensions",
    sections: [
      {
        heading: "Equations of motion",
        lines: [
          "v = u + a t.",
          "s = u t + (1/2) a t^2.",
          "v^2 = u^2 + 2 a s.",
          "These hold only for constant acceleration.",
        ],
      },
      {
        heading: "Projectile motion",
        lines: [
          "Treat horizontal and vertical motion separately.",
          "Time of flight = 2 u sin theta / g.",
          "Maximum height = u^2 sin^2 theta / (2 g).",
          "Range = u^2 sin 2 theta / g, maximum at 45 degrees.",
        ],
      },
      {
        heading: "Graphs",
        lines: [
          "The slope of a displacement-time graph is velocity.",
          "The slope of a velocity-time graph is acceleration.",
          "The area under a velocity-time graph is displacement.",
        ],
      },
    ],
  },
  {
    slug: "board-chemistry-reactions",
    title: "Board chemistry reactions",
    subtitle: "Class 10 and 12 · reaction types with examples",
    sections: [
      {
        heading: "Types of reaction",
        lines: [
          "Combination: two reactants form one product, CaO + H2O gives Ca(OH)2.",
          "Decomposition: one reactant splits, CaCO3 on heating gives CaO + CO2.",
          "Displacement: Fe + CuSO4 gives FeSO4 + Cu.",
          "Double displacement: Na2SO4 + BaCl2 gives BaSO4 precipitate + NaCl.",
        ],
      },
      {
        heading: "Redox",
        lines: [
          "Oxidation is loss of electrons; reduction is gain. Remember OIL RIG.",
          "The oxidising agent is itself reduced.",
          "Balance by the half reaction method in acidic or basic medium.",
        ],
      },
      {
        heading: "Observations to quote",
        lines: [
          "Iron nail in copper sulphate: blue colour fades, brown deposit appears.",
          "Heating lead nitrate: brown fumes of nitrogen dioxide.",
          "Zinc with dilute sulphuric acid: colourless gas that burns with a pop.",
        ],
      },
    ],
  },
  {
    slug: "polity-rajya-sabha-notes",
    title: "Polity - Rajya Sabha notes",
    subtitle: "General Studies · composition, powers and comparison",
    sections: [
      {
        heading: "Composition",
        lines: [
          "Maximum strength 250: 238 elected from states and union territories, 12 nominated by the President.",
          "Members are elected by state legislative assemblies through a single transferable vote.",
          "The term is six years, with one third retiring every two years.",
          "The House is permanent and cannot be dissolved.",
        ],
      },
      {
        heading: "Presiding officers",
        lines: [
          "The Vice-President of India is the ex-officio Chairman.",
          "The Deputy Chairman is elected from among the members.",
          "The Chairman is not a member of the House.",
        ],
      },
      {
        heading: "Special powers",
        lines: [
          "Article 249 - allows Parliament to legislate on a State List subject.",
          "Article 312 - allows the creation of a new All India Service.",
          "A money bill cannot originate here and must be returned within 14 days.",
        ],
      },
    ],
  },
];
