export type CreditItem = {
  label?: string;
  name?: string;
  url?: string;
  subtitle?: string; // NEW
};

export type CreditCategory = {
  title?: string;
  layout?: 'single' | 'two-column';
  subtitle?: string; // NEW
  items: CreditItem[];
};

const credits: CreditCategory[] = [
  {
    title: 'Creator',
    layout: 'single',
    items: [
      { name: 'Yossava Michael', url: 'https://twitter.com/Yossa123Michael'}
    ]
  },
  {
    title: 'Visual Artist',
    layout: 'two-column',
    subtitle: 'Illustration Artist',
    items: [
      { label: 'Illustrator Artist 1', name: 'Yossava Michael', url: 'https://twitter.com/Yossa123Michael'},
    ]
  },
    {
    layout: 'two-column',
    subtitle: 'Animation Artist',
    items: [
      { label: 'Animation Artist 1', name: 'Yossava Michael', url: 'https://twitter.com/Yossa123Michael'},
    ]
  },
  {
    title: 'Sound Artist',
    layout: 'two-column',
    subtitle: 'Backsound Artist',
    items: [
      { label: 'MusicRevolution', name: 'Route 66 Blues - Loop', url: 'https://example.com/route-66'},
      
    ]
  },
  {
    layout: 'two-column',
    subtitle: 'Sound Effect Artist',
    items: [
      { label: 'Universfield', name: 'Computer Mouse Click', url: 'https://example.com/mouse-click' },
      { label: 'KoiRoylers', name: 'Correct', url: 'https://example.com/correct' },
      { label: 'erinthut1992', name: 'BUZZER OR WRONG ANSWER', url: 'https://example.com/wrong' },
    ]
  },
  {
    title: 'Font',
    layout: 'single',
    items: [
      { name: 'Nunito', url: 'https://fonts.google.com/specimen/Nunito'}
    ]
  },
];

export default credits;
