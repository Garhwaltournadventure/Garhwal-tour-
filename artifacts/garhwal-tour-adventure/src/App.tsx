import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Bike,
  CarFront,
  Check,
  ChevronDown,
  Compass,
  Instagram,
  Languages,
  Menu,
  MessageCircle,
  Mountain,
  Phone,
  Send,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const WHATSAPP_NUMBER = '918077016559';
const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/JuhvMkETd4GjBYkY7?g_st=ac';

type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'es'
  | 'pt'
  | 'ja'
  | 'zh';
const languageOptions: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

const detectLanguage = (): LanguageCode => {
  if (typeof navigator === 'undefined') return 'en';
  const supported = new Set(languageOptions.map((option) => option.code));
  for (const locale of navigator.languages.length ? navigator.languages : [navigator.language]) {
    const code = locale.toLowerCase().split('-')[0] as LanguageCode;
    if (supported.has(code)) return code;
  }
  return 'en';
};

type Copy = {
  nav: { services: string; routes: string; reviews: string; plan: string };
  hero: { eyebrow: string; title: string; accent: string; description: string; primary: string; secondary: string };
  services: { kicker: string; title: string; accent: string; description: string; enquire: string };
  routes: { kicker: string; title: string; accent: string; description: string; action: string };
  reviews: { kicker: string; title: string; accent: string; description: string; read: string; leave: string };
  enquiry: { kicker: string; title: string; accent: string; description: string; formTitle: string; name: string; dates: string; group: string; interest: string; note: string; submit: string };
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const baseCopy: Copy = {
  nav: { services: 'Ways to go', routes: 'Route notes', reviews: 'Reviews', plan: 'Plan a trip' },
  hero: {
    eyebrow: 'Local roads. Wider days.',
    title: 'Go where',
    accent: 'the road',
    description: 'Personal Uttarakhand journeys with a local hand on the wheel. Tours, rentals, rafting and room to change your mind.',
    primary: 'Plan with Mangal',
    secondary: 'See route ideas',
  },
  services: {
    kicker: '01 / Ways to go',
    title: 'Bring the idea.',
    accent: 'We’ll find the way.',
    description: 'Some travellers arrive with a full route. Some just know they want mountain air. Both are a good place to start.',
    enquire: 'Tell us what you have in mind',
  },
  routes: {
    kicker: '02 / Route notes',
    title: 'A few good',
    accent: 'places to begin.',
    description: 'Starting points, not packages. Tell us what you want more of, and what you want to skip.',
    action: 'Shape this route',
  },
  reviews: {
    kicker: '03 / Traveller notes',
    title: 'Good trips',
    accent: 'stay with you.',
    description: 'Read what travellers say, or share your experience on Google.',
    read: 'Read Google Reviews',
    leave: 'Leave a Google Review',
  },
  enquiry: {
    kicker: '04 / Your turn',
    title: 'Let’s put',
    accent: 'a route together.',
    description: 'Send a few details. Your message opens WhatsApp with Mangal — no account, no commitment, just a useful first conversation.',
    formTitle: 'Where are you headed?',
    name: 'Your name',
    dates: 'Dates',
    group: 'Group size',
    interest: 'I’m interested in',
    note: 'Anything to know?',
    submit: 'Open WhatsApp enquiry',
  },
};

const localizedCopy: Partial<Record<LanguageCode, DeepPartial<Copy>>> = {
  hi: {
    nav: { services: 'सेवाएँ', routes: 'रूट सुझाव', reviews: 'समीक्षाएँ', plan: 'यात्रा बनाएँ' },
    hero: { eyebrow: 'स्थानीय रास्ते। बड़े दिन।', title: 'जहाँ', accent: 'रास्ता खुलता है', description: 'उत्तराखंड की व्यक्तिगत यात्राएँ — टूर, किराये की गाड़ियाँ, राफ्टिंग और आपकी पसंद के अनुसार योजना।', primary: 'मंगल के साथ योजना बनाएँ', secondary: 'रूट देखें' },
    services: { kicker: '01 / हमारी सेवाएँ', title: 'बस विचार लाइए।', accent: 'रास्ता हम ढूँढेंगे।', description: 'पूरा रूट हो या बस पहाड़ों की हवा की इच्छा — हर यात्रा की शुरुआत यहीं से होती है।', enquire: 'पूछताछ करें' },
    routes: { kicker: '02 / रूट सुझाव', title: 'कुछ अच्छे', accent: 'शुरुआती रास्ते।', description: 'ये पैकेज नहीं, शुरुआत के विचार हैं। अपनी पसंद हमें बताइए।', action: 'यह रूट बनाएँ' },
    reviews: { kicker: '03 / यात्रियों की बातें', title: 'अच्छी यात्राएँ', accent: 'हमेशा साथ रहती हैं।', description: 'Google पर यात्रियों की बातें पढ़ें या अपना अनुभव साझा करें।' },
    enquiry: { kicker: '04 / आपकी बारी', title: 'एक', accent: 'रूट साथ बनाएँ।', description: 'कुछ जानकारी भेजें। आपका संदेश मंगल के WhatsApp पर खुलेगा — बिना अकाउंट, बिना दबाव।', formTitle: 'कहाँ जाना है?', name: 'आपका नाम', dates: 'तारीखें', group: 'लोगों की संख्या', interest: 'मेरी रुचि है', note: 'कुछ और बताना है?', submit: 'WhatsApp पूछताछ खोलें' },
  },
  bn: { nav: { services: 'পরিষেবা', routes: 'রুট নোট', reviews: 'পর্যালোচনা', plan: 'ভ্রমণ পরিকল্পনা' }, hero: { eyebrow: 'স্থানীয় পথ। বড় দিন।', title: 'যেখানে', accent: 'পথ খুলে যায়', description: 'উত্তরাখণ্ডের ব্যক্তিগত ভ্রমণ — ট্যুর, গাড়ি ও বাইক ভাড়া, রাফটিং এবং আপনার মতো করে পরিকল্পনা।', primary: 'মঙ্গলের সাথে পরিকল্পনা করুন', secondary: 'রুট দেখুন' }, reviews: { kicker: '03 / ভ্রমণকারীর কথা', title: 'ভালো ভ্রমণ', accent: 'মনে থেকে যায়।', description: 'Google-এ ভ্রমণকারীদের কথা পড়ুন বা নিজের অভিজ্ঞতা শেয়ার করুন।' } },
  mr: { nav: { services: 'सेवा', routes: 'मार्ग सूचना', reviews: 'अभिप्राय', plan: 'प्रवास आखणी' }, hero: { eyebrow: 'स्थानिक रस्ते. मोठे दिवस.', title: 'जिथे', accent: 'रस्ता खुलतो', description: 'उत्तराखंडमधील वैयक्तिक प्रवास — टूर, वाहन भाडे, राफ्टिंग आणि तुमच्या आवडीची आखणी.', primary: 'मंगलसोबत आखणी करा', secondary: 'मार्ग पहा' } },
  gu: { nav: { services: 'સેવાઓ', routes: 'રૂટ સૂચનો', reviews: 'સમીક્ષાઓ', plan: 'પ્રવાસનું આયોજન' }, hero: { eyebrow: 'સ્થાનિક રસ્તા. મોટા દિવસો.', title: 'જ્યાં', accent: 'રસ્તો ખુલે', description: 'ઉત્તરાખંડની તમારી પોતાની મુસાફરી — ટૂર, કાર અને બાઇક ભાડે, રાફ્ટિંગ અને તમારી પસંદગીનું આયોજન.', primary: 'મંગલ સાથે આયોજન કરો', secondary: 'રૂટ જુઓ' } },
  pa: { nav: { services: 'ਸੇਵਾਵਾਂ', routes: 'ਰੂਟ ਸੁਝਾਅ', reviews: 'ਸਮੀਖਿਆਵਾਂ', plan: 'ਯਾਤਰਾ ਬਣਾਓ' }, hero: { eyebrow: 'ਸਥਾਨਕ ਰਸਤੇ। ਵੱਡੇ ਦਿਨ।', title: 'ਜਿੱਥੇ', accent: 'ਰਾਹ ਖੁੱਲ੍ਹਦਾ ਹੈ', description: 'ਉੱਤਰਾਖੰਡ ਦੀਆਂ ਨਿੱਜੀ ਯਾਤਰਾਵਾਂ — ਟੂਰ, ਕਿਰਾਏ ਦੀਆਂ ਗੱਡੀਆਂ, ਰਾਫਟਿੰਗ ਅਤੇ ਤੁਹਾਡੀ ਪਸੰਦ ਅਨੁਸਾਰ ਯੋਜਨਾ।', primary: 'ਮੰਗਲ ਨਾਲ ਯੋਜਨਾ ਬਣਾਓ', secondary: 'ਰੂਟ ਵੇਖੋ' } },
  ta: { nav: { services: 'சேவைகள்', routes: 'வழித்தட குறிப்புகள்', reviews: 'மதிப்புரைகள்', plan: 'பயணத்தைத் திட்டமிடுங்கள்' }, hero: { eyebrow: 'உள்ளூர் சாலைகள். பெரிய நாட்கள்.', title: 'சாலை', accent: 'திறக்கும் இடம்', description: 'உத்தரகண்டின் தனிப்பட்ட பயணங்கள் — சுற்றுலா, வாகன வாடகை, ராஃப்டிங் மற்றும் உங்கள் விருப்பத்திற்கேற்ற திட்டம்.', primary: 'மங்கலுடன் திட்டமிடுங்கள்', secondary: 'வழித்தடங்களைப் பாருங்கள்' } },
  te: { nav: { services: 'సేవలు', routes: 'మార్గ సూచనలు', reviews: 'సమీక్షలు', plan: 'యాత్రను ప్లాన్ చేయండి' }, hero: { eyebrow: 'స్థానిక రహదారులు. పెద్ద రోజులు.', title: 'దారి', accent: 'తెరుచుకునే చోట', description: 'ఉత్తరాఖండ్ వ్యక్తిగత ప్రయాణాలు — టూర్లు, వాహన అద్దె, రాఫ్టింగ్ మరియు మీ ఇష్టానికి తగిన ప్రణాళిక.', primary: 'మంగళతో ప్లాన్ చేయండి', secondary: 'మార్గాలు చూడండి' } },
  kn: { nav: { services: 'ಸೇವೆಗಳು', routes: 'ಮಾರ್ಗ ಸೂಚನೆಗಳು', reviews: 'ವಿಮರ್ಶೆಗಳು', plan: 'ಪ್ರವಾಸ ಯೋಜಿಸಿ' }, hero: { eyebrow: 'ಸ್ಥಳೀಯ ರಸ್ತೆಗಳು. ದೊಡ್ಡ ದಿನಗಳು.', title: 'ದಾರಿ', accent: 'ತೆರೆದುಕೊಳ್ಳುವಲ್ಲಿ', description: 'ಉತ್ತರಾಖಂಡದ ವೈಯಕ್ತಿಕ ಪ್ರವಾಸಗಳು — ಟೂರ್, ವಾಹನ ಬಾಡಿಗೆ, ರಾಫ್ಟಿಂಗ್ ಮತ್ತು ನಿಮ್ಮ ಇಚ್ಛೆಯಂತೆ ಯೋಜನೆ.', primary: 'ಮಂಗಲ್ ಜೊತೆ ಯೋಜಿಸಿ', secondary: 'ಮಾರ್ಗಗಳನ್ನು ನೋಡಿ' } },
  ml: { nav: { services: 'സേവനങ്ങൾ', routes: 'റൂട്ട് കുറിപ്പുകൾ', reviews: 'അവലോകനങ്ങൾ', plan: 'യാത്ര ആസൂത്രണം ചെയ്യുക' }, hero: { eyebrow: 'പ്രാദേശിക വഴികൾ. വലിയ ദിവസങ്ങൾ.', title: 'വഴി', accent: 'തുറക്കുന്നിടത്ത്', description: 'ഉത്തരാഖണ്ഡിലെ വ്യക്തിഗത യാത്രകൾ — ടൂറുകൾ, വാഹന വാടക, റാഫ്റ്റിംഗ്, നിങ്ങളുടെ ഇഷ്ടത്തിനനുസരിച്ചുള്ള ആസൂത്രണം.', primary: 'മംഗലിനൊപ്പം ആസൂത്രണം ചെയ്യുക', secondary: 'റൂട്ടുകൾ കാണുക' } },
  es: {
    nav: { services: 'Servicios', routes: 'Rutas', reviews: 'Reseñas', plan: 'Planifica tu viaje' },
    hero: {
      eyebrow: 'Carreteras locales. Grandes días.',
      title: 'Ve donde',
      accent: 'se abre el camino',
      description: 'Viajes personalizados por Uttarakhand con un guía local. Tours, alquileres, rafting y planes flexibles.',
      primary: 'Planificar con Mangal',
      secondary: 'Ver rutas',
    },
    services: {
      kicker: '01 / Servicios',
      title: 'Trae la idea.',
      accent: 'Encontraremos el camino.',
      description: 'Puedes llegar con una ruta completa o solo con ganas de montaña. Ambas son un buen comienzo.',
      enquire: 'Cuéntanos qué buscas',
    },
    routes: {
      kicker: '02 / Rutas',
      title: 'Algunos buenos',
      accent: 'lugares para empezar.',
      description: 'Puntos de partida, no paquetes. Dinos qué quieres disfrutar y qué prefieres evitar.',
      action: 'Diseñar esta ruta',
    },
    reviews: {
      kicker: '03 / Opiniones de viajeros',
      title: 'Los buenos viajes',
      accent: 'se quedan contigo.',
      description: 'Lee las opiniones en Google o comparte tu experiencia.',
      read: 'Leer reseñas de Google',
      leave: 'Dejar una reseña en Google',
    },
    enquiry: {
      kicker: '04 / Tu turno',
      title: 'Hagamos',
      accent: 'una ruta juntos.',
      description: 'Envía algunos detalles. Tu mensaje abrirá WhatsApp con Mangal, sin cuenta ni compromiso.',
      formTitle: '¿Adónde quieres ir?',
      name: 'Tu nombre',
      dates: 'Fechas',
      group: 'Tamaño del grupo',
      interest: 'Me interesa',
      note: '¿Algo más que debamos saber?',
      submit: 'Abrir consulta de WhatsApp',
    },
  },

  pt: {
    nav: { services: 'Serviços', routes: 'Rotas', reviews: 'Avaliações', plan: 'Planear viagem' },
    hero: {
      eyebrow: 'Estradas locais. Grandes dias.',
      title: 'Vá onde',
      accent: 'a estrada se abre',
      description: 'Viagens personalizadas por Uttarakhand com um guia local. Tours, alugueres, rafting e planos flexíveis.',
      primary: 'Planear com Mangal',
      secondary: 'Ver rotas',
    },
    services: {
      kicker: '01 / Serviços',
      title: 'Traga a ideia.',
      accent: 'Encontraremos o caminho.',
      description: 'Pode chegar com uma rota completa ou apenas com vontade de montanha. Ambos são um bom começo.',
      enquire: 'Conte-nos o que procura',
    },
    routes: {
      kicker: '02 / Rotas',
      title: 'Alguns bons',
      accent: 'lugares para começar.',
      description: 'Pontos de partida, não pacotes. Diga-nos o que quer aproveitar e o que prefere evitar.',
      action: 'Criar esta rota',
    },
    reviews: {
      kicker: '03 / Opiniões de viajantes',
      title: 'As boas viagens',
      accent: 'ficam consigo.',
      description: 'Leia as avaliações no Google ou partilhe a sua experiência.',
      read: 'Ler avaliações no Google',
      leave: 'Deixar uma avaliação no Google',
    },
    enquiry: {
      kicker: '04 / A sua vez',
      title: 'Vamos criar',
      accent: 'uma rota juntos.',
      description: 'Envie alguns detalhes. A sua mensagem abrirá o WhatsApp com Mangal, sem conta nem compromisso.',
      formTitle: 'Para onde quer ir?',
      name: 'O seu nome',
      dates: 'Datas',
      group: 'Tamanho do grupo',
      interest: 'Tenho interesse em',
      note: 'Algo mais que devemos saber?',
      submit: 'Abrir consulta no WhatsApp',
    },
  },

  ja: {
    nav: { services: 'サービス', routes: 'ルート', reviews: '口コミ', plan: '旅を計画' },
    hero: {
      eyebrow: '地元の道。広がる一日。',
      title: '道が',
      accent: '開ける場所へ',
      description: '地元ガイドと巡るウッタラーカンドのオーダーメイド旅行。ツアー、レンタル、ラフティング、自由な旅程をご提案します。',
      primary: 'マンガルと計画する',
      secondary: 'ルートを見る',
    },
    services: {
      kicker: '01 / サービス',
      title: 'アイデアを。',
      accent: '道は私たちが見つけます。',
      description: 'しっかりしたルートがある方も、ただ山の空気を楽しみたい方も。どちらも旅の良いスタートです。',
      enquire: '希望を伝える',
    },
    routes: {
      kicker: '02 / ルート',
      title: '旅の始まりに',
      accent: 'おすすめの場所。',
      description: 'パッケージではなく、旅の出発点です。楽しみたいこと、避けたいことを教えてください。',
      action: 'このルートを作る',
    },
    reviews: {
      kicker: '03 / 旅行者の口コミ',
      title: '良い旅は',
      accent: '心に残ります。',
      description: 'Googleで旅行者の口コミを読んだり、ご自身の体験を共有できます。',
      read: 'Googleの口コミを見る',
      leave: 'Googleに口コミを書く',
    },
    enquiry: {
      kicker: '04 / あなたの番',
      title: '一緒に',
      accent: 'ルートを作りましょう。',
      description: 'いくつかの詳細を送ってください。アカウントや予約なしで、マンガルとのWhatsApp会話が始まります。',
      formTitle: 'どこへ行きたいですか？',
      name: 'お名前',
      dates: '日程',
      group: '人数',
      interest: '興味があるもの',
      note: 'その他に伝えておきたいこと',
      submit: 'WhatsAppで問い合わせる',
    },
  },

  zh: {
    nav: { services: '服务', routes: '路线', reviews: '评价', plan: '规划旅行' },
    hero: {
      eyebrow: '当地道路。精彩旅程。',
      title: '去往',
      accent: '道路展开的地方',
      description: '由当地向导带你探索北阿坎德邦。提供定制旅行、车辆租赁、漂流和灵活的行程规划。',
      primary: '与 Mangal 一起规划',
      secondary: '查看路线',
    },
    services: {
      kicker: '01 / 服务',
      title: '带上你的想法。',
      accent: '我们来寻找路线。',
      description: '你可以带着完整的路线来，也可以只是想感受山间空气。两者都是很好的开始。',
      enquire: '告诉我们你的想法',
    },
    routes: {
      kicker: '02 / 路线',
      title: '一些不错的',
      accent: '旅行起点。',
      description: '这里是旅行灵感，而不是固定套餐。告诉我们你想体验什么，以及想避开什么。',
      action: '规划这条路线',
    },
    reviews: {
      kicker: '03 / 旅行者评价',
      title: '美好的旅程',
      accent: '值得一直记住。',
      description: '在 Google 上阅读旅行者评价，或分享你的旅行体验。',
      read: '阅读 Google 评价',
      leave: '留下 Google 评价',
    },
    enquiry: {
      kicker: '04 / 轮到你了',
      title: '一起规划',
      accent: '一段旅程。',
      description: '发送一些旅行信息。你的消息会直接打开 WhatsApp 联系 Mangal，无需账号，也没有任何承诺。',
      formTitle: '你想去哪里？',
      name: '你的名字',
      dates: '日期',
      group: '人数',
      interest: '我感兴趣的是',
      note: '还有什么需要告诉我们？',
      submit: '打开 WhatsApp 咨询',
    },
     },
};

function getCopy(language: LanguageCode): Copy {
  const override = localizedCopy[language];
  if (!override) return baseCopy;
  return {
    ...baseCopy,
    ...override,
    nav: { ...baseCopy.nav, ...override.nav },
    hero: { ...baseCopy.hero, ...override.hero },
    services: { ...baseCopy.services, ...override.services },
    routes: { ...baseCopy.routes, ...override.routes },
    reviews: { ...baseCopy.reviews, ...override.reviews },
    enquiry: { ...baseCopy.enquiry, ...override.enquiry },
  };
}

const openWhatsApp = (message: string) => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
};

const services = [
  { icon: Compass, number: '01', title: 'Uttarakhand tours', copy: 'Thoughtful routes through river towns, oak forests and high valleys.', tone: 'clay' },
  { icon: CarFront, number: '02', title: 'Car rental', copy: 'Comfortable road days with local help on the bends and stops.', tone: 'moss' },
  { icon: Bike, number: '03', title: 'Bike & scooty rental', copy: 'Two wheels for easy days around Rishikesh and Mussoorie.', tone: 'saffron' },
  { icon: Waves, number: '04', title: 'River rafting', copy: 'Find a Ganga experience that fits your season and comfort level.', tone: 'river' },
  { icon: Sparkles, number: '05', title: 'Custom planning', copy: 'Share your dates and must-sees. We will shape the rest together.', tone: 'sky' },
];

const routes = [
  { name: 'Rishikesh to Auli', eyebrow: 'River air → snow light', days: '5–7 days', copy: 'Start by the Ganga, then climb towards Joshimath and Auli for wide-open mountain days.', image: '/garhwal-hero.jpg', accent: 'clay' },
  { name: 'Haridwar · Rishikesh · Mussoorie', eyebrow: 'A first taste of Garhwal', days: '4–6 days', copy: 'Evening aarti, rafting currents and the cool cedar-edged lanes of Mussoorie.', image: '/rishikesh-rafting.jpg', accent: 'moss' },
  { name: 'Chopta · Nainital · Corbett', eyebrow: 'For the road-curious', days: '5–8 days', copy: 'Mix high valley quiet, lake-country mornings and forest-side stays in one flexible route.', image: '/garhwal-hero.jpg', accent: 'saffron' },
];

const BOOKING_APP_URL = 'https://garhwal-booking.pages.dev';

const navItems = (copy: Copy) => [
  { href: '#ways-to-go', label: copy.nav.services },
  { href: '#route-notes', label: copy.nav.routes },
  { href: '#reviews', label: copy.nav.reviews },
  { href: '#enquire', label: copy.nav.plan },
  { href: BOOKING_APP_URL, label: 'Book Now', external: true },
];

function LogoMark() {
  return <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8c75a] text-[#15322f]" aria-hidden="true"><Mountain size={22} strokeWidth={2.2} /><span className="absolute bottom-[7px] left-[10px] h-[3px] w-5 rounded-full bg-[#e75b3b]" /></span>;
}

function LanguagePicker({ language, setLanguage }: { language: LanguageCode; setLanguage: (language: LanguageCode) => void }) {
  const [open, setOpen] = useState(false);
  const current = languageOptions.find((option) => option.code === language) ?? languageOptions[0];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Choose language" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-bold text-white transition hover:border-[#f8c75a] hover:text-[#f8c75a]">
        <Languages size={15} /><span>{current.native}</span><ChevronDown size={13} className={open ? 'rotate-180 transition' : 'transition'} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 grid min-w-[170px] gap-1 rounded-2xl border border-[#d9dfd2] bg-[#fffaf0] p-2 text-[#15322f] shadow-2xl">
          {languageOptions.map((option) => (
            <button key={option.code} type="button" onClick={() => { setLanguage(option.code); setOpen(false); }} className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition hover:bg-[#e6eee5] ${language === option.code ? 'bg-[#f8c75a]' : ''}`}>
              <span>{option.native}</span><span className="text-[10px] font-normal opacity-60">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WhatsAppButton({ children, message, className = '' }: { children: ReactNode; message: string; className?: string }) {
  return <button type="button" data-testid="button-whatsapp-cta" onClick={() => openWhatsApp(message)} className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#e75b3b] px-5 py-3 text-sm font-bold text-[#fffaf0] shadow-[0_10px_25px_rgba(231,91,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d94f31] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8c75a] focus-visible:ring-offset-2 ${className}`}><MessageCircle size={17} strokeWidth={2.4} />{children}</button>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [trip, setTrip] = useState('');
  const [sent, setSent] = useState(false);
  const copy = getCopy(language);
  const items = navItems(copy);

  useEffect(() => {
    setLanguage(detectLanguage());
    document.title = 'Garhwal Tour N Adventure | Travel Uttarakhand with a local guide';
    const description = 'Personal, flexible journeys through Garhwal — tours, rentals, rafting and custom plans with Mangal Singh Jethuri in Uttarakhand.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', description);
    const setSocial = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
      tag.setAttribute('content', content);
    };
    setSocial('og:title', 'Garhwal Tour N Adventure');
    setSocial('og:description', description);
    setSocial('og:type', 'website');
    setSocial('og:locale', 'en_IN');
  }, []);

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || 'A traveller');
    const dates = String(form.get('dates') || 'Dates to be decided');
    const group = String(form.get('group') || 'Group size to be decided');
    const interest = String(form.get('interest') || 'A Uttarakhand trip');
    const note = String(form.get('note') || 'I would love your suggestions.');
    openWhatsApp(`Namaste Mangal, I am ${name}. I am enquiring about ${interest} in Uttarakhand. Dates: ${dates}. Group: ${group}. A little about the trip: ${note}`);
    setSent(true);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-grain min-h-[100dvh] bg-[#f8f4e9] text-[#15322f]">
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 lg:px-8">
          <a href="#top" data-testid="link-brand-home" className="flex items-center gap-3 text-[#fffaf0]"><LogoMark /><span className="leading-tight"><span className="block text-[13px] font-extrabold tracking-[0.03em]">GARHWAL TOUR</span><span className="block font-display text-[15px] italic text-[#f8c75a]">N Adventure</span></span></a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {items.map((item) => <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} data-testid={`link-nav-${item.external ? 'book-now' : item.href.slice(1)}`} className={`nav-link text-[12px] font-bold uppercase tracking-[0.14em] transition hover:text-[#f8c75a] ${item.external ? 'rounded-full bg-[#f8c75a] px-4 py-2.5 text-[#15322f] hover:bg-[#ffd77b] hover:text-[#15322f]' : 'text-[#e6eee5]'}`}>{item.label}</a>)}
            <LanguagePicker language={language} setLanguage={setLanguage} />
            <WhatsAppButton message="Namaste Mangal, I would like to enquire about planning a Uttarakhand trip." className="px-4 py-2.5 text-xs">WhatsApp us</WhatsAppButton>
          </nav>
          <button type="button" data-testid="button-open-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" className="rounded-full border border-white/25 p-2.5 text-white lg:hidden"><Menu size={21} /></button>
        </div>
        {menuOpen && <div className="fixed inset-0 z-50 bg-[#15322f] px-6 py-6 lg:hidden"><div className="flex items-center justify-between"><a href="#top" onClick={closeMenu} className="flex items-center gap-3 text-[#fffaf0]"><LogoMark /><span className="text-sm font-extrabold tracking-[0.04em]">GARHWAL TOUR <span className="font-display italic text-[#f8c75a]">N Adventure</span></span></a><button type="button" onClick={closeMenu} aria-label="Close navigation menu" className="rounded-full border border-white/20 p-2 text-white"><X size={21} /></button></div><nav className="mt-16 flex flex-col gap-6" aria-label="Mobile navigation">{items.map((item) => <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} onClick={closeMenu} className={item.external ? 'inline-flex w-fit rounded-full bg-[#f8c75a] px-5 py-3 font-sans text-base font-extrabold not-italic text-[#15322f]' : 'font-display text-4xl italic text-[#fffaf0]'}>{item.label}</a>)}<div className="mt-3"><LanguagePicker language={language} setLanguage={setLanguage} /></div><WhatsAppButton message="Namaste Mangal, I would like to enquire about planning a Uttarakhand trip." className="mt-2 w-full py-4">Start a WhatsApp chat</WhatsAppButton></nav><p className="absolute bottom-8 left-6 font-mono-custom text-[10px] uppercase tracking-[0.2em] text-[#b7ccc0]">Uttarakhand, India · MSME UDYAM-UK-11-0006387</p></div>}
      </header>

      <main id="top">
        <section className="relative isolate flex min-h-[665px] items-end overflow-hidden bg-[#15322f] pb-14 pt-32 text-[#fffaf0] md:min-h-[700px] md:pb-20">
          <img src="/garhwal-hero.jpg" alt="A winding road through the Garhwal Himalaya at dawn" className="hero-image absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-75" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(21,50,47,.96)_0%,rgba(21,50,47,.7)_39%,rgba(21,50,47,.16)_76%,rgba(21,50,47,.35)_100%)]" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(21,50,47,.78)_0%,transparent_55%)]" />
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.6fr)] lg:items-end lg:px-8"><div><div className="reveal flex items-center gap-3 font-mono-custom text-[10px] font-medium uppercase tracking-[0.24em] text-[#f8c75a]"><span className="h-px w-9 bg-[#f8c75a]" /> {copy.hero.eyebrow}</div><h1 className="reveal reveal-delay-1 mt-6 max-w-[760px] font-display text-[clamp(4rem,9vw,8rem)] font-semibold leading-[.86] tracking-[-.055em] text-balance">{copy.hero.title}<br /><span className="italic text-[#f8c75a]">{copy.hero.accent}</span><br />opens up.</h1><p className="reveal reveal-delay-2 mt-8 max-w-[490px] text-base leading-7 text-[#dce7dc] md:text-lg">{copy.hero.description}</p><div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3"><WhatsAppButton message="Namaste Mangal, I would like to plan a flexible Uttarakhand trip. Please help me with route ideas." className="px-6 py-3.5">{copy.hero.primary}</WhatsAppButton><a href={BOOKING_APP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-hero-book-now" className="inline-flex items-center gap-2 rounded-full bg-[#f8c75a] px-6 py-3.5 text-sm font-extrabold text-[#15322f] transition hover:bg-[#ffd77b]">Book Now <ArrowRight size={16} /></a><a href="#route-notes" data-testid="link-hero-route-notes" className="group inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3.5 text-sm font-bold text-white transition hover:border-[#f8c75a] hover:text-[#f8c75a]">{copy.hero.secondary} <ArrowDownRight size={16} className="transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a></div></div><div className="reveal reveal-delay-4 hidden justify-self-end pb-3 lg:block"><div className="max-w-[265px] border-l border-[#f8c75a]/70 pl-5"><p className="font-display text-2xl italic leading-tight text-[#fffaf0]">“The best plan is the one that leaves space for a good view.”</p><p className="mt-4 font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[#b7ccc0]">— Mangal Singh Jethuri, owner</p></div></div></div>
          <a href="#ways-to-go" className="absolute bottom-7 right-6 hidden items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[0.2em] text-[#dce7dc] md:flex">Scroll to wander <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><ChevronDown size={15} /></span></a>
        </section>

        <section id="ways-to-go" className="scroll-mt-10 bg-[#f8f4e9] py-20 md:py-24"><div className="mx-auto max-w-[1240px] px-5 lg:px-8"><div className="grid gap-8 md:grid-cols-[.75fr_1.25fr] md:items-end"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#e75b3b]">{copy.services.kicker}</p><h2 className="mt-5 max-w-[400px] font-display text-5xl leading-[.94] tracking-[-.04em] md:text-6xl">{copy.services.title}<br /><span className="italic text-[#e75b3b]">{copy.services.accent}</span></h2></div><div className="max-w-[480px] md:justify-self-end"><p className="text-base leading-7 text-[#56736b]">{copy.services.description}</p><a href="#enquire" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#15322f] underline decoration-[#e75b3b] decoration-2 underline-offset-4 transition hover:text-[#e75b3b]">{copy.services.enquire} <ArrowRight size={15} /></a></div></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{services.map((service) => { const Icon = service.icon; return <a key={service.number} href="#enquire" onClick={() => setTrip(service.title)} data-testid={`card-service-${service.number}`} className={`service-card group relative min-h-[245px] overflow-hidden rounded-[1.4rem] p-6 ${service.tone === 'clay' ? 'bg-[#e75b3b] text-[#fffaf0]' : service.tone === 'moss' ? 'bg-[#dfe8d4]' : service.tone === 'saffron' ? 'bg-[#f8c75a]' : service.tone === 'river' ? 'bg-[#a9d6d5]' : 'bg-[#d7d8e2]'}`}><span className="font-mono-custom text-[10px] opacity-65">{service.number}</span><span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition group-hover:rotate-[-12deg]"><Icon size={19} /></span><div className="absolute inset-x-6 bottom-6"><h3 className="max-w-[180px] font-display text-3xl leading-[.95] tracking-[-.03em]">{service.title}</h3><p className="mt-3 max-w-[210px] text-xs leading-5 opacity-75">{service.copy}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold">Ask about it <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span></div></a>; })}</div></div></section>

        <section id="route-notes" className="scroll-mt-10 overflow-hidden bg-[#15322f] py-20 text-[#fffaf0] md:py-24"><div className="mx-auto max-w-[1240px] px-5 lg:px-8"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#f8c75a]">{copy.routes.kicker}</p><h2 className="mt-5 max-w-[640px] font-display text-5xl leading-[.93] tracking-[-.04em] md:text-7xl">{copy.routes.title}<br /><span className="italic text-[#f8c75a]">{copy.routes.accent}</span></h2></div><p className="max-w-[300px] text-sm leading-6 text-[#b7ccc0]">{copy.routes.description}</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{routes.map((route, index) => <a href="#enquire" key={route.name} onClick={() => setTrip(route.name)} data-testid={`card-route-${index}`} className="route-card group overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#1d443f]"><div className="relative min-h-[190px] overflow-hidden"><img src={route.image} alt="" className="route-image h-full w-full object-cover opacity-85" /><div className="absolute inset-0 bg-gradient-to-t from-[#15322f]/75 to-transparent" /><span className={`absolute left-5 top-5 rounded-full px-3 py-1.5 font-mono-custom text-[9px] uppercase tracking-[0.13em] ${route.accent === 'clay' ? 'bg-[#e75b3b] text-white' : route.accent === 'moss' ? 'bg-[#dfe8d4] text-[#15322f]' : 'bg-[#f8c75a] text-[#15322f]'}`}>{route.days}</span></div><div className="flex min-h-[190px] flex-col justify-between p-6"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.14em] text-[#b7ccc0]">{route.eyebrow}</p><h3 className="mt-4 font-display text-3xl leading-[.95] tracking-[-.03em] text-[#fffaf0]">{route.name}</h3><p className="mt-4 text-sm leading-6 text-[#b7ccc0]">{route.copy}</p></div><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f8c75a]">{copy.routes.action} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></div></a>)}</div></div></section>

        <section id="reviews" className="scroll-mt-10 bg-[#e6eee5] py-20 md:py-24"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#e75b3b]">{copy.reviews.kicker}</p><h2 className="mt-5 max-w-[500px] font-display text-5xl leading-[.93] tracking-[-.04em] md:text-7xl">{copy.reviews.title}<br /><span className="italic text-[#e75b3b]">{copy.reviews.accent}</span></h2><p className="mt-7 max-w-[420px] text-base leading-7 text-[#56736b]">{copy.reviews.description}</p><div className="mt-8 rounded-2xl border border-[#b5cdbb] bg-[#fffaf0]/60 p-5"><p className="font-display text-3xl italic">Google traveller notes</p><p className="mt-2 text-xs leading-5 text-[#56736b]">Read reviews from travellers who have experienced Garhwal Tour N Adventure.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="group rounded-[1.4rem] bg-[#fffaf0] p-6 shadow-[0_15px_40px_rgba(21,50,47,0.08)] transition hover:-translate-y-1"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e75b3b] text-[#fffaf0]"><ArrowRight size={19} /></div><h3 className="mt-7 font-display text-3xl italic">Read Google Reviews</h3><p className="mt-3 text-sm leading-6 text-[#56736b]">See what other travellers say about their journeys.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#15322f]">{copy.reviews.read} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></a><a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="group rounded-[1.4rem] bg-[#15322f] p-6 text-[#fffaf0] transition hover:-translate-y-1"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8c75a] text-[#15322f]"><ArrowRight size={19} /></div><h3 className="mt-7 font-display text-3xl italic">Leave a Google Review</h3><p className="mt-3 text-sm leading-6 text-[#b7ccc0]">Your experience can help the next traveller choose their road.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#f8c75a]">{copy.reviews.leave} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></a></div></div></section>

        <section id="enquire" className="scroll-mt-8 bg-[#e75b3b] py-20 text-[#fffaf0] md:py-24"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#f8c75a]">{copy.enquiry.kicker}</p><h2 className="mt-5 max-w-[500px] font-display text-6xl leading-[.88] tracking-[-.05em] md:text-8xl">{copy.enquiry.title}<br /><span className="italic text-[#f8c75a]">{copy.enquiry.accent}</span></h2><p className="mt-7 max-w-[400px] text-base leading-7 text-[#ffe7d7]">{copy.enquiry.description}</p><div className="mt-8 space-y-4 border-t border-white/20 pt-6"><a href="tel:+918077016559" className="flex items-center gap-3 text-sm font-bold transition hover:text-[#f8c75a]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><Phone size={15} /></span> +91 80770 16559</a><button type="button" onClick={() => openWhatsApp('Namaste Mangal, I would like to ask about a Uttarakhand trip.')} className="flex items-center gap-3 text-sm font-bold transition hover:text-[#f8c75a]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><MessageCircle size={15} /></span> WhatsApp Mangal directly</button></div></div><div className="rounded-[1.5rem] bg-[#fffaf0] p-6 text-[#15322f] shadow-[0_25px_60px_rgba(102,32,15,0.18)] md:p-9">{sent ? <div className="flex min-h-[385px] flex-col items-start justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe8d4] text-[#15322f]"><Check size={27} /></span><h3 className="mt-7 font-display text-5xl leading-none">Message<br /><span className="italic text-[#e75b3b]">ready to go.</span></h3><p className="mt-5 max-w-[390px] text-sm leading-6 text-[#56736b]">WhatsApp should be open with your enquiry. If it did not open, use the direct contact above.</p><button type="button" onClick={() => setSent(false)} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold underline decoration-[#e75b3b] decoration-2 underline-offset-4">Send another enquiry <ArrowRight size={14} /></button></div> : <form onSubmit={submitEnquiry} className="space-y-5"><div className="flex items-start justify-between gap-4 border-b border-[#d9dfd2] pb-5"><div><p className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-[#e75b3b]">Quick enquiry</p><h3 className="mt-2 font-display text-3xl leading-none">{copy.enquiry.formTitle}</h3></div><Send size={21} className="mt-1 text-[#e75b3b]" /></div><label className="block"><span className="mb-2 block text-xs font-extrabold">{copy.enquiry.name}</span><input name="name" required className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="What should we call you?" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-extrabold">{copy.enquiry.dates}</span><input name="dates" className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="e.g. 12–18 October" /></label><label className="block"><span className="mb-2 block text-xs font-extrabold">{copy.enquiry.group}</span><input name="group" className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#e75b3b] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="e.g. 4 adults" /></label></div><label className="block"><span className="mb-2 block text-xs font-extrabold">{copy.enquiry.interest}</span><select name="interest" value={trip} onChange={(event) => setTrip(event.target.value)} className="w-full appearance-none rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15"><option value="">A little bit of everything</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}{routes.map((route) => <option key={route.name}>{route.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-extrabold">{copy.enquiry.note}</span><textarea name="note" rows={3} className="w-full resize-none rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="Slow mornings, a short trek, temple visits, rafting..." /></label><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15322f] px-5 py-4 text-sm font-extrabold text-[#fffaf0] transition hover:bg-[#28534b]">{copy.enquiry.submit} <ArrowRight size={16} /></button><p className="text-center font-mono-custom text-[9px] uppercase tracking-[0.13em] text-[#789087]">No booking form. Just a direct conversation.</p></form>}</div></div></section>
      </main>

      <TravelAIAssistant />
      <footer className="bg-[#15322f] py-10 text-[#fffaf0]"><div className="mx-auto max-w-[1240px] px-5 lg:px-8"><div className="flex flex-col justify-between gap-7 border-b border-white/15 pb-8 md:flex-row md:items-end"><div className="flex items-center gap-3"><LogoMark /><div><p className="text-sm font-extrabold tracking-[0.04em]">GARHWAL TOUR N ADVENTURE</p><p className="mt-1 text-xs text-[#b7ccc0]">Uttarakhand, India · Owner: Mangal Singh Jethuri</p><p className="mt-1 font-mono-custom text-[9px] uppercase tracking-[0.12em] text-[#8eb0a0]">MSME / UDYAM-UK-11-0006387</p></div></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-[#dce7dc]">{items.map((item) => <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} className={`transition hover:text-[#f8c75a] ${item.external ? 'font-extrabold text-[#f8c75a]' : ''}`}>{item.label}</a>)}<a href="tel:+918077016559" className="transition hover:text-[#f8c75a]">+91 80770 16559</a></div></div><div className="flex flex-col justify-between gap-4 pt-6 text-[10px] text-[#8eb0a0] sm:flex-row"><p>Built for the curious, by a local.</p><div className="flex items-center gap-5"><span>© {new Date().getFullYear()} Garhwal Tour N Adventure</span><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Garhwal Tour N Adventure on Instagram" className="transition hover:text-[#f8c75a]"><Instagram size={15} /></a></div></div></div></footer>
      <button type="button" onClick={() => openWhatsApp('Namaste Mangal, I would like to plan a trip through Uttarakhand.')} aria-label="Open WhatsApp enquiry" className="whatsapp-pulse fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#2d9a62] text-white shadow-lg transition hover:scale-105 hover:bg-[#258653] md:bottom-7 md:right-7"><MessageCircle size={25} /></button>
    </div>
  );
}

function TravelAIAssistant() {
  const [open,setOpen]=useState(false);
  const [question,setQuestion]=useState('');
  const [messages,setMessages]=useState<{role:'user'|'assistant';text:string}[]>([
    {role:'assistant',text:'Namaste! I am your Garhwal travel assistant. Ask me about routes, distances, travel time, sightseeing or itinerary ideas.'}
  ]);
  const [loading,setLoading]=useState(false);

  const ask=async(e:FormEvent)=>{
    e.preventDefault();
    const q=question.trim();
    if(!q||loading)return;
    setQuestion('');
    setMessages(m=>[...m,{role:'user',text:q}]);
    setLoading(true);
    try{
      const r=await fetch('https://garhwal-booking.pages.dev/api/ai',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({message:q})
      });
      const data=await r.json();
      setMessages(m=>[...m,{role:'assistant',text:data.answer||data.error||'Sorry, I could not answer that right now.'}]);
    }catch{
      setMessages(m=>[...m,{role:'assistant',text:'The travel assistant is temporarily unavailable. Please use WhatsApp to speak with us directly.'}]);
    }finally{setLoading(false);}
  };

  return <div className="fixed bottom-5 right-5 z-[60]">
    {open && <div className="mb-3 flex h-[min(70vh,520px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-2xl border border-[#d7ded3] bg-[#fffaf0] shadow-2xl">
      <div className="flex items-center justify-between bg-[#15322f] px-4 py-3 text-[#fffaf0]">
        <div><div className="text-sm font-extrabold">AI Travel Assistant</div><div className="text-[10px] text-[#b7ccc0]">Garhwal Tour N Adventure</div></div>
        <button aria-label="Close travel assistant" onClick={()=>setOpen(false)} className="rounded-full p-2 hover:bg-white/10"><X size={18}/></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m,i)=><div key={i} className={m.role==='user'?'ml-8 rounded-2xl rounded-br-sm bg-[#f36b08] px-3 py-2 text-sm text-white':'mr-8 rounded-2xl rounded-bl-sm bg-[#e8eee8] px-3 py-2 text-sm text-[#15322f]'}>{m.text}</div>)}
        {loading && <div className="mr-8 rounded-2xl bg-[#e8eee8] px-3 py-2 text-sm text-[#15322f]">Checking travel information…</div>}
      </div>
      <form onSubmit={ask} className="flex gap-2 border-t border-[#d7ded3] p-3">
        <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask: Delhi to Rishikesh?" className="min-w-0 flex-1 rounded-xl border border-[#cbd5cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#15322f]" />
        <button disabled={loading||!question.trim()} className="rounded-xl bg-[#15322f] px-3 text-white disabled:opacity-50"><Send size={17}/></button>
      </form>
    </div>}
    <button onClick={()=>setOpen(v=>!v)} aria-label="Open AI travel assistant" className="flex items-center gap-2 rounded-full bg-[#f36b08] px-4 py-3 font-extrabold text-white shadow-xl transition hover:scale-[1.02]">
      <Sparkles size={19}/><span className="hidden sm:inline">AI Travel Guide</span><span className="sm:hidden">AI</span>
    </button>
  </div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider>;
}

export default App;
