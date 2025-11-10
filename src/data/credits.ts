export type CreditItem = {
  label: string;
  name: string;
  url?: string;
};

export type CreditCategory = {
  title: string;
  layout?: 'single' | 'two-column';
  items: CreditItem[];
};

const credits: CreditCategory[] = [
  {
    title: 'Creator',
    layout: 'single',
    items: [
      { label: 'Creator', name: 'Yossa Michael', url: 'https://twitter.com/Yossa123Michael' },
    ],
  },
  {
    title: 'Backsound Artist',
    layout: 'two-column',
    items: [
      { label: 'BGM 1', name: 'Artist BGM 1', url: 'https://example.com/artist-bgm-1' },
      { label: 'BGM 2', name: 'Artist BGM 2', url: 'https://example.com/artist-bgm-2' },
    ],
  },
  {
    title: 'Sound Effect Artist',
    layout: 'two-column',
    items: [
      { label: 'SFX Pack', name: 'Artist SFX', url: 'https://example.com/artist-sfx' },
    ],
  },
  {
    title: 'Font',
    layout: 'single',
    items: [
      { label: 'Font', name: 'Nunito', url: 'https://fonts.google.com/specimen/Nunito' },
    ],
  },
];

export default credits;
