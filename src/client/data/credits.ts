export type CreditItem = {
  label?: string;
  name?: string;
  url?: string;
  subtitle?: string;
};

export type CreditCategory = {
  title?: string;
  layout?: 'single' | 'two-column';
  subtitle?: string;
  items: CreditItem[];
};

const credits: CreditCategory[] = [
  {
    title: 'Creator',
    layout: 'single',
    items: [
      { name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse'}
    ]
  },
  {
    title: 'Visual Artist',
    layout: 'two-column',
    subtitle: 'Illustration Artist',
    items: [
      { label: 'Illustrator Artist 1', name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse'},
    ]
  },
    {
    layout: 'two-column',
    subtitle: 'Animation Artist',
    items: [
      { label: 'Animation Artist 1', name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse'},
    ]
  },
  {
    title: 'Sound Artist',
    layout: 'two-column',
    subtitle: 'Backsound Artist',
    items: [
      { label: 'MusicRevolution', name: 'Route 66 Blues - Loop', url: 'https://stock.adobe.com/id/search/audio?k=676139913'},
      
    ]
  },
  {
    layout: 'two-column',
    subtitle: 'Sound Effect Artist',
    items: [
      { label: 'Universfield', name: 'Computer Mouse Click', url: 'https://pixabay.com/sound-effects/computer-mouse-click-352734/' },
      { label: 'KoiRoylers', name: 'Correct', url: 'https://pixabay.com/sound-effects/correct-356013/' },
      { label: 'erinthut1992', name: 'BUZZER OR WRONG ANSWER', url: 'https://pixabay.com/sound-effects/buzzer-or-wrong-answer-20582/' },
    ]
  },
  {
    title: 'Font',
    layout: 'single',
    subtitle: 'Google Fonts', 
    items: [
      { name: 'Nunito', url: 'https://fonts.google.com/specimen/Nunito'}
    ]
  },
];

export default credits;
