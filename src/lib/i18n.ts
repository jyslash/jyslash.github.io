export const LANGS = ['ko', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const SECTIONS = ['about', 'journal', 'books', 'projects'] as const;
export type Section = (typeof SECTIONS)[number];

// UI strings. Content text lives in content/, never here.
// The main menu stays in English in both languages, for the look of the nav.
const ui = {
  ko: {
    'nav.about': 'About',
    'nav.journal': 'Journal',
    'nav.books': 'Books',
    'nav.projects': 'Projects',
    'lang.name': '한국어',
    'theme.toggle': '다크 모드 전환',
    'menu.open': '메뉴 열기',
    'notTranslated': '아직 한국어로 옮기지 않은 글이에요.',
    'readMore': '더 읽기',
    'about.highlight': '하이라이트',
    'about.everything': '전체',
    'about.highlightSoon': '하이라이트 보기는 준비 중이에요.',
    'projects.selected': '대표 작업',
    'projects.everything': '전체',
    'projects.noneSelected': '아직 대표 작업을 고르지 않았어요.',
    'projects.group.Google': 'Google',
    'projects.group.LINE': 'LINE',
    'projects.group.Naver': 'Naver',
    'projects.group.side': '사이드 프로젝트',
    'projects.group.old': '예전 작업',
    'projects.group.talk': '강연·인터뷰',
    'books.empty': '아직 기록한 책이 없어요.',
    'books.reading': '읽는 중',
    'books.finished': '다 읽음',
    'kind.journal': '저널',
    'kind.project': '프로젝트',
    'kind.bookStarted': '읽기 시작',
    'kind.bookFinished': '다 읽음',
    'footer.location': 'JY는 지금<br>캘리포니아 마운틴뷰에 있어요',
    'footer.localClock': 'JY 시간',
    'footer.seoulClock': '서울',
    'footer.contact': '연락해요',
  },
  en: {
    'nav.about': 'About',
    'nav.journal': 'Journal',
    'nav.books': 'Books',
    'nav.projects': 'Projects',
    'lang.name': 'English',
    'theme.toggle': 'Toggle dark mode',
    'menu.open': 'Open menu',
    'notTranslated': 'Not translated yet — showing the Korean original.',
    'readMore': 'Read more',
    'about.highlight': 'Highlight',
    'about.everything': 'Everything',
    'about.highlightSoon': 'The Highlight view is on its way.',
    'projects.selected': 'Selected works',
    'projects.everything': 'Everything',
    'projects.noneSelected': 'No selected works yet.',
    'projects.group.Google': 'Google',
    'projects.group.LINE': 'LINE',
    'projects.group.Naver': 'Naver',
    'projects.group.side': 'Side Projects',
    'projects.group.old': 'Old Works',
    'projects.group.talk': 'Talks',
    'books.empty': 'No books logged yet.',
    'books.reading': 'Reading',
    'books.finished': 'Finished',
    'kind.journal': 'Journal',
    'kind.project': 'Project',
    'kind.bookStarted': 'Started reading',
    'kind.bookFinished': 'Finished reading',
    'footer.location': 'JY is currently in<br>Mountain View, California',
    'footer.localClock': 'JY time',
    'footer.seoulClock': 'Seoul, Korea',
    'footer.contact': "Let's stay in touch",
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ko' ? 'en' : 'ko';
}

/** The same page in the other language: /ko/books/ -> /en/books/ */
export function alternatePath(pathname: string, lang: Lang): string {
  return pathname.replace(/^\/(ko|en)(?=\/)/, `/${otherLang(lang)}`);
}

export function sectionPath(lang: Lang, section: Section): string {
  return section === 'journal' ? `/${lang}/` : `/${lang}/${section}/`;
}

export const langPaths = () => LANGS.map((lang) => ({ params: { lang } }));
