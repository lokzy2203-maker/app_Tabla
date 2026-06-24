export type TaalPreset = {
  name: string;
  matras: number;
  notation: string;
};

export const TAAL_PRESETS: TaalPreset[] = [
  {
    name: "Teentaal (16 beats)",
    matras: 16,
    notation: "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha",
  },
  {
    name: "Keherwa (8 beats)",
    matras: 8,
    notation: "Dha Ge Na Ti | Na Ka Dhi Na",
  },
  {
    name: "Ektaal (12 beats)",
    matras: 12,
    notation: "Dhin Dhin Dhage Tirakita | Tu Na Kat Ta | Dhage Tirakita Dhin Dhin",
  },
  {
    name: "Rupak (7 beats)",
    matras: 7,
    notation: "Tin Tin Na | Dhin Na | Dhin Na",
  },
  {
    name: "Dadra (6 beats)",
    matras: 6,
    notation: "Dha Dhin Na | Dha Tin Na",
  },
];

export type NotationToken = {
  raw: string;
  isRest: boolean;
  isBarStart: boolean;
};

export function parseNotation(notation: string): NotationToken[] {
  const segments = notation
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const tokens: NotationToken[] = [];

  segments.forEach((segment) => {
    const words = segment.split(/\s+/).filter(Boolean);
    words.forEach((word, i) => {
      tokens.push({
        raw: word,
        isRest: word === "-" || word === "_",
        isBarStart: i === 0,
      });
    });
  });

  return tokens;
}
