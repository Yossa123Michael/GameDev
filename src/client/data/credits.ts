export type CreditItem = { label: string; name: string; url?: string; };
export type CreditCategory = { title: string; subtitle?: string; layout?: 'single' | 'two-column'; items: CreditItem[]; };

const credits: CreditCategory[] = [
  { title: 'Creator', layout: 'single', items: [{ label: 'Creator', name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse' }] },
  { title: 'Illustration Artist', subtitle: 'Full Asset', layout: 'single', items: [{ label: 'Illustrator Artist', name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse' }] },
  { title: '', subtitle: 'Full Asset', layout: 'single', items: [{ label: 'Illustrator Artist', name: 'Yossava Michael', url: 'https://limyossa.wixsite.com/yossuniverse' }] },
  { title: 'Sound Artist', subtitle: 'Backsound', layout: 'two-column', items: [
      { label: 'MusicRevolution', name: 'Route 66 Blues - Loop', url: 'https://stock.adobe.com/tr/search/audio?k=676139913'},
    ]},
  { title: '', subtitle: 'Sound Effect', layout: 'two-column', items: [
      { label: 'Universfield', name: 'Computer Mouse Click', url: 'https://pixabay.com/sound-effects/computer-mouse-click-352734/'},
      { label: 'KoiRoylers', name: 'Correct', url: 'https://pixabay.com/sound-effects/correct-356013/'},
      { label: 'eritnhut1992', name: 'BUZZER OR WRONG ANSWER', url: 'https://pixabay.com/sound-effects/buzzer-or-wrong-answer-20582/'},
    ] },
  { title: 'Sound Effect Artist',  subtitle: 'gws', layout: 'two-column', items: [
      { label: 'SFX Pack', name: 'Artist SFX', url: 'https://example.com/artist-sfx' },
    ] },
  { title: 'Font', layout: 'single', items: [{ label: 'Font', name: 'Nunito', url: 'https://fonts.google.com/specimen/Nunito' }] },
];

export default credits;
