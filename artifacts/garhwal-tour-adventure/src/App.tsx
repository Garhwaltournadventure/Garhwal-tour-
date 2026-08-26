import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownRight,
  ArrowRight,
  Bike,
  CarFront,
  Check,
  ChevronDown,
  Compass,
  Instagram,
  Menu,
  MessageCircle,
  Mountain,
  Phone,
  Send,
  Sparkles,
  TentTree,
  Waves,
  X,
} from 'lucide-react';

const queryClient = new QueryClient();
const WHATSAPP_NUMBER = '918077016559';

const openWhatsApp = (message: string) => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
};

const services = [
  { icon: Compass, number: '01', title: 'Uttarakhand tours', copy: 'Thoughtful routes through river towns, oak forests and high valleys — paced around your people.', tone: 'clay' },
  { icon: CarFront, number: '02', title: 'Car rental', copy: 'A comfortable way to cover the bends, with a local driver who knows when to stop for the view.', tone: 'moss' },
  { icon: Bike, number: '03', title: 'Bike & scooty rental', copy: 'Two wheels for easy days around Rishikesh, Mussoorie and the roads that invite a detour.', tone: 'saffron' },
  { icon: Waves, number: '04', title: 'River rafting', copy: 'Make room for the Ganga. We will help you choose an experience that fits your season and comfort level.', tone: 'river' },
  { icon: Sparkles, number: '05', title: 'Custom planning', copy: 'Have a loose idea? Tell us your dates, group and must-sees. We will shape the rest together.', tone: 'sky' },
];

const routes = [
  { name: 'Rishikesh to Auli', eyebrow: 'River air → snow light', days: '5–7 days', copy: 'Start slow by the Ganga, then climb towards Joshimath and Auli for wide-open mountain days.', image: '/garhwal-hero.jpg', accent: 'clay' },
  { name: 'Haridwar · Rishikesh · Mussoorie', eyebrow: 'A first taste of Garhwal', days: '4–6 days', copy: 'A flexible introduction: evening aarti, rafting currents and the cool, cedar-edged lanes of Mussoorie.', image: '/rishikesh-rafting.jpg', accent: 'moss' },
  { name: 'Chopta & Panch Prayag', eyebrow: 'For the road-curious', days: '5–8 days', copy: 'Follow confluences and quiet bends towards Chopta. Add short walks, village stops or a slower morning.', image: '/garhwal-hero.jpg', accent: 'saffron' },
  { name: 'Nainital & Jim Corbett', eyebrow: 'Lake mornings · wild edges', days: '4–6 days', copy: 'Pair the stillness of Kumaon’s lake country with a forest-side stay in the foothills.', image: '/garhwal-hero.jpg', accent: 'river' },
];

const navItems = [
  { href: '#ways-to-go', label: 'Ways to go' },
  { href: '#route-notes', label: 'Route notes' },
  { href: '#why-local', label: 'Why local' },
  { href: '#enquire', label: 'Plan a trip' },
];

function LogoMark() {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8c75a] text-[#15322f]" aria-hidden="true">
      <Mountain size={22} strokeWidth={2.2} />
      <span className="absolute bottom-[7px] left-[10px] h-[3px] w-5 rounded-full bg-[#e75b3b]" />
    </span>
  );
}

function WhatsAppButton({ children, message, className = '' }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="button"
      data-testid="button-whatsapp-cta"
      onClick={() => openWhatsApp(message)}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#e75b3b] px-5 py-3 text-sm font-bold text-[#fffaf0] shadow-[0_10px_25px_rgba(231,91,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d94f31] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f8c75a] focus-visible:ring-offset-2 ${className}`}
    >
      <MessageCircle size={17} strokeWidth={2.4} />
      {children}
    </button>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trip, setTrip] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Garhwal Tour N Adventure | Travel Uttarakhand with a local guide';
    const description = 'Personal, flexible journeys through Garhwal — tours, rentals, rafting and custom plans with Mangal Singh Jethuri in Uttarakhand.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    const setSocial = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
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
          <a href="#top" data-testid="link-brand-home" className="flex items-center gap-3 text-[#fffaf0]">
            <LogoMark />
            <span className="leading-tight">
              <span className="block text-[13px] font-extrabold tracking-[0.03em]">GARHWAL TOUR</span>
              <span className="block font-display text-[15px] italic text-[#f8c75a]">N Adventure</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className="nav-link text-[12px] font-bold uppercase tracking-[0.14em] text-[#e6eee5] transition hover:text-[#f8c75a]">
                {item.label}
              </a>
            ))}
            <WhatsAppButton message="Namaste Mangal, I would like to enquire about planning a Uttarakhand trip." className="px-4 py-2.5 text-xs">
              WhatsApp us
            </WhatsAppButton>
          </nav>
          <button type="button" data-testid="button-open-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" className="rounded-full border border-white/25 p-2.5 text-white lg:hidden">
            <Menu size={21} />
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-[#15322f] px-6 py-6 lg:hidden">
            <div className="flex items-center justify-between">
              <a href="#top" onClick={closeMenu} data-testid="link-mobile-brand" className="flex items-center gap-3 text-[#fffaf0]"><LogoMark /><span className="text-sm font-extrabold tracking-[0.04em]">GARHWAL TOUR <span className="font-display italic text-[#f8c75a]">N Adventure</span></span></a>
              <button type="button" data-testid="button-close-mobile-menu" onClick={closeMenu} aria-label="Close navigation menu" className="rounded-full border border-white/20 p-2 text-white"><X size={21} /></button>
            </div>
            <nav className="mt-20 flex flex-col gap-7" aria-label="Mobile navigation">
              {navItems.map((item, index) => (
                <a key={item.href} href={item.href} onClick={closeMenu} data-testid={`link-mobile-nav-${index}`} className="font-display text-4xl italic text-[#fffaf0]">{item.label}</a>
              ))}
              <WhatsAppButton message="Namaste Mangal, I would like to enquire about planning a Uttarakhand trip." className="mt-5 w-full py-4">Start a WhatsApp chat</WhatsAppButton>
            </nav>
            <p className="absolute bottom-8 left-6 font-mono-custom text-[10px] uppercase tracking-[0.2em] text-[#b7ccc0]">Uttarakhand, India · Since local</p>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative isolate flex min-h-[760px] items-end overflow-hidden bg-[#15322f] pb-14 pt-36 text-[#fffaf0] md:min-h-[780px] md:pb-20">
          <img src="/garhwal-hero.jpg" alt="A winding road through the Garhwal Himalaya at dawn" className="hero-image absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-75" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(21,50,47,.96)_0%,rgba(21,50,47,.7)_39%,rgba(21,50,47,.16)_76%,rgba(21,50,47,.35)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(21,50,47,.78)_0%,transparent_55%)]" />
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.6fr)] lg:items-end lg:px-8">
            <div>
              <div className="reveal flex items-center gap-3 font-mono-custom text-[10px] font-medium uppercase tracking-[0.24em] text-[#f8c75a]">
                <span className="h-px w-9 bg-[#f8c75a]" /> Local roads. Wider days.
              </div>
              <h1 className="reveal reveal-delay-1 mt-6 max-w-[760px] font-display text-[clamp(4rem,9vw,8rem)] font-semibold leading-[.86] tracking-[-.055em] text-balance">
                Go where<br /><span className="italic text-[#f8c75a]">the road</span><br />opens up.
              </h1>
              <p className="reveal reveal-delay-2 mt-8 max-w-[490px] text-base leading-7 text-[#dce7dc] md:text-lg">
                Personal Uttarakhand journeys with a local hand on the wheel. Tours, rentals, rafting and room to change your mind.
              </p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
                <WhatsAppButton message="Namaste Mangal, I would like to plan a flexible Uttarakhand trip. Please help me with route ideas." className="px-6 py-3.5">Plan with Mangal</WhatsAppButton>
                <a href="#route-notes" data-testid="link-hero-route-notes" className="group inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3.5 text-sm font-bold text-white transition hover:border-[#f8c75a] hover:text-[#f8c75a]">
                  See route ideas <ArrowDownRight size={16} className="transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </a>
              </div>
            </div>
            <div className="reveal reveal-delay-4 hidden justify-self-end pb-3 lg:block">
              <div className="max-w-[265px] border-l border-[#f8c75a]/70 pl-5">
                <p className="font-display text-2xl italic leading-tight text-[#fffaf0]">“The best plan is the one that leaves space for a good view.”</p>
                <p className="mt-4 font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[#b7ccc0]">— Mangal Singh Jethuri, owner</p>
              </div>
            </div>
          </div>
          <a href="#ways-to-go" data-testid="link-scroll-ways-to-go" className="absolute bottom-7 right-6 hidden items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[0.2em] text-[#dce7dc] md:flex">
            Scroll to wander <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><ChevronDown size={15} /></span>
          </a>
        </section>

        <section className="border-b border-[#d9dfd2] bg-[#fffaf0]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-[#d9dfd2] md:grid-cols-4 lg:px-8">
            {[
              ['01', 'Local point of view', 'routes shaped around you'],
              ['02', 'Flexible by design', 'change pace as you go'],
              ['03', 'One direct contact', 'speak to Mangal on WhatsApp'],
              ['04', 'Mountain-aware', 'season comes into the plan'],
            ].map(([number, title, copy]) => (
              <div key={number} data-testid={`text-trust-point-${number}`} className="px-5 py-7 md:px-6 lg:py-8">
                <span className="font-mono-custom text-[10px] text-[#e75b3b]">{number}</span>
                <p className="mt-2 text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#56736b]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ways-to-go" className="scroll-mt-10 bg-[#f8f4e9] py-24 md:py-32">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="grid gap-8 md:grid-cols-[.75fr_1.25fr] md:items-end">
              <div>
                <p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#e75b3b]">01 / Ways to go</p>
                <h2 className="mt-5 max-w-[400px] font-display text-5xl leading-[.94] tracking-[-.04em] md:text-6xl">Bring the idea.<br /><span className="italic text-[#e75b3b]">We’ll find the way.</span></h2>
              </div>
              <div className="max-w-[480px] md:justify-self-end">
                <p className="text-base leading-7 text-[#56736b]">Some travellers arrive with a full route. Some just know they want mountain air. Both are a good place to start.</p>
                <a href="#enquire" data-testid="link-services-enquire" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#15322f] underline decoration-[#e75b3b] decoration-2 underline-offset-4 transition hover:text-[#e75b3b]">Tell us what you have in mind <ArrowRight size={15} /></a>
              </div>
            </div>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <a key={service.number} href="#enquire" onClick={() => setTrip(service.title)} data-testid={`card-service-${service.number}`} className={`service-card group relative min-h-[275px] overflow-hidden rounded-[1.4rem] p-6 ${service.tone === 'clay' ? 'bg-[#e75b3b] text-[#fffaf0]' : service.tone === 'moss' ? 'bg-[#dfe8d4]' : service.tone === 'saffron' ? 'bg-[#f8c75a]' : service.tone === 'river' ? 'bg-[#a9d6d5]' : 'bg-[#d7d8e2]'}`}>
                    <span className="font-mono-custom text-[10px] opacity-65">{service.number}</span>
                    <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition group-hover:rotate-[-12deg]"><Icon size={19} /></span>
                    <div className="absolute inset-x-6 bottom-6">
                      <h3 className="max-w-[180px] font-display text-3xl leading-[.95] tracking-[-.03em]">{service.title}</h3>
                      <p className="mt-4 max-w-[210px] text-xs leading-5 opacity-75">{service.copy}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-xs font-extrabold">Ask about it <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section id="route-notes" className="scroll-mt-10 overflow-hidden bg-[#15322f] py-24 text-[#fffaf0] md:py-32">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#f8c75a]">02 / Route notes</p>
                <h2 className="mt-5 max-w-[640px] font-display text-5xl leading-[.93] tracking-[-.04em] md:text-7xl">A few good<br /><span className="italic text-[#f8c75a]">places to begin.</span></h2>
              </div>
              <p className="max-w-[300px] text-sm leading-6 text-[#b7ccc0]">These are starting points, not packages. Tell us what you want more of, and what you want to skip.</p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {routes.map((route, index) => (
                <a href="#enquire" key={route.name} onClick={() => setTrip(route.name)} data-testid={`card-route-${index}`} className="route-card group grid min-h-[355px] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#1d443f] md:grid-cols-[.88fr_1.12fr]">
                  <div className="relative min-h-[220px] overflow-hidden">
                    <img src={route.image} alt="" className="route-image h-full w-full object-cover opacity-85" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#15322f]/75 to-transparent" />
                    <span className={`absolute left-5 top-5 rounded-full px-3 py-1.5 font-mono-custom text-[9px] uppercase tracking-[0.13em] ${route.accent === 'clay' ? 'bg-[#e75b3b] text-white' : route.accent === 'moss' ? 'bg-[#dfe8d4] text-[#15322f]' : route.accent === 'saffron' ? 'bg-[#f8c75a] text-[#15322f]' : 'bg-[#a9d6d5] text-[#15322f]'}`}>{route.days}</span>
                    <span className="absolute bottom-5 left-5 font-mono-custom text-[10px] uppercase tracking-[0.16em] text-[#fffaf0]/75">Route {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex flex-col justify-between p-6 md:p-7">
                    <div>
                      <p className="font-mono-custom text-[10px] uppercase tracking-[0.14em] text-[#b7ccc0]">{route.eyebrow}</p>
                      <h3 className="mt-4 font-display text-3xl leading-[.95] tracking-[-.03em] text-[#fffaf0] md:text-4xl">{route.name}</h3>
                      <p className="mt-5 text-sm leading-6 text-[#b7ccc0]">{route.copy}</p>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#f8c75a]">Shape this route <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#e6eee5] py-24 md:py-32">
          <div className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full border border-[#b5cdbb] md:right-16 md:h-96 md:w-96" />
          <div className="pointer-events-none absolute -right-4 top-24 h-60 w-60 rounded-full border border-[#b5cdbb] md:right-28 md:h-80 md:w-80" />
          <div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#e75b3b]">03 / Read the season</p>
              <h2 className="mt-5 max-w-[500px] font-display text-5xl leading-[.93] tracking-[-.04em] md:text-7xl">The hills<br /><span className="italic text-[#e75b3b]">have a rhythm.</span></h2>
              <p className="mt-7 max-w-[440px] text-base leading-7 text-[#56736b]">Rafting days, snowy roads and forest walks each have their moment. We will help you choose an experience that makes sense for when you arrive.</p>
              <WhatsAppButton message="Namaste Mangal, I am wondering what Uttarakhand experiences suit my travel dates. Could you guide me by season?" className="mt-8">Ask about my season</WhatsAppButton>
            </div>
            <div className="relative z-10 grid gap-3 sm:grid-cols-3">
              {[
                { season: 'Spring', months: 'Mar — Apr', title: 'Clear mornings', copy: 'Good for road days, temple towns and the first green on the slopes.', color: 'bg-[#f8c75a]' },
                { season: 'Summer', months: 'May — Jun', title: 'River time', copy: 'A lively window for Rishikesh, higher escapes and long daylight.', color: 'bg-[#a9d6d5]' },
                { season: 'Autumn', months: 'Oct — Nov', title: 'Big light', copy: 'Crisp skies and wide views before winter settles into the high roads.', color: 'bg-[#e75b3b] text-[#fffaf0]' },
              ].map((item) => (
                <div key={item.season} data-testid={`card-season-${item.season.toLowerCase()}`} className={`rounded-[1.3rem] p-5 ${item.color}`}>
                  <p className="font-mono-custom text-[10px] uppercase tracking-[0.13em] opacity-65">{item.months}</p>
                  <h3 className="mt-12 font-display text-3xl italic leading-none">{item.season}</h3>
                  <p className="mt-4 text-sm font-extrabold">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 opacity-75">{item.copy}</p>
                </div>
              ))}
              <p className="sm:col-span-3 font-mono-custom text-[10px] uppercase tracking-[0.12em] text-[#56736b]">Conditions change by altitude. Confirm the practical details with us before you set off.</p>
            </div>
          </div>
        </section>

        <section id="why-local" className="scroll-mt-10 bg-[#fffaf0] py-24 md:py-32">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div className="relative mx-auto w-full max-w-[430px]">
                <div className="absolute -left-3 -top-3 h-full w-full rounded-[1.6rem] border border-[#e75b3b] md:-left-5 md:-top-5" />
                <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.6rem] bg-[#15322f] p-7 text-[#fffaf0] md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-[#f8c75a]">Local note / 01</span>
                    <TentTree size={22} className="text-[#f8c75a]" />
                  </div>
                  <div>
                    <p className="font-display text-5xl italic leading-[.95] md:text-6xl">You bring<br />the curiosity.</p>
                    <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8c75a] font-display text-lg text-[#15322f]">M</span>
                      <div><p className="text-sm font-bold">Mangal Singh Jethuri</p><p className="font-mono-custom text-[9px] uppercase tracking-[0.13em] text-[#b7ccc0]">Owner · Garhwal Tour N Adventure</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#e75b3b]">04 / Why local</p>
                <h2 className="mt-5 max-w-[600px] font-display text-5xl leading-[.93] tracking-[-.04em] md:text-7xl">Not a marketplace.<br /><span className="italic text-[#e75b3b]">A local conversation.</span></h2>
                <p className="mt-7 max-w-[560px] text-base leading-7 text-[#56736b]">Garhwal is home ground. That means your trip can stay open: one more chai stop, a quieter road, a change of plan when the mountains ask for it.</p>
                <div className="mt-9 grid gap-4 border-t border-[#d9dfd2] pt-7 sm:grid-cols-2">
                  {[
                    ['Talk to one person', 'No maze of forms or hand-offs. Start with a message to Mangal.'],
                    ['Plan around your people', 'Solo, family, friends or a full car — the pace starts with you.'],
                    ['Keep it practical', 'Dates, group size, weather and road conditions belong in the conversation.'],
                    ['Leave room for wonder', 'The memorable bit is often the stop nobody wrote down.'],
                  ].map(([title, copy], index) => (
                    <div key={title} data-testid={`text-local-principle-${index}`} className="flex gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dfe8d4] text-[#15322f]"><Check size={12} strokeWidth={3} /></span>
                      <div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-5 text-[#56736b]">{copy}</p></div>
                    </div>
                  ))}
                </div>
                <WhatsAppButton message="Namaste Mangal, I found Garhwal Tour N Adventure and would like to speak about a trip in Uttarakhand." className="mt-9">Speak with Mangal</WhatsAppButton>
              </div>
            </div>
          </div>
        </section>

        <section id="enquire" className="scroll-mt-8 bg-[#e75b3b] py-20 text-[#fffaf0] md:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[0.23em] text-[#f8c75a]">05 / Your turn</p>
              <h2 className="mt-5 max-w-[500px] font-display text-6xl leading-[.88] tracking-[-.05em] md:text-8xl">Let’s put<br /><span className="italic text-[#f8c75a]">a route</span><br />together.</h2>
              <p className="mt-7 max-w-[400px] text-base leading-7 text-[#ffe7d7]">Send a few details. Your message opens WhatsApp with Mangal — no account, no commitment, just a useful first conversation.</p>
              <div className="mt-8 space-y-4 border-t border-white/20 pt-6">
                <a href="tel:+918077016559" data-testid="link-call-mangal" className="flex items-center gap-3 text-sm font-bold transition hover:text-[#f8c75a]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><Phone size={15} /></span> +91 80770 16559</a>
                <button type="button" data-testid="button-direct-whatsapp" onClick={() => openWhatsApp('Namaste Mangal, I would like to ask about a Uttarakhand trip.')} className="flex items-center gap-3 text-sm font-bold transition hover:text-[#f8c75a]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30"><MessageCircle size={15} /></span> WhatsApp Mangal directly</button>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[#fffaf0] p-6 text-[#15322f] shadow-[0_25px_60px_rgba(102,32,15,0.18)] md:p-9">
              {sent ? (
                <div className="flex min-h-[425px] flex-col items-start justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe8d4] text-[#15322f]"><Check size={27} /></span>
                  <h3 className="mt-7 font-display text-5xl leading-none">Message<br /><span className="italic text-[#e75b3b]">ready to go.</span></h3>
                  <p className="mt-5 max-w-[390px] text-sm leading-6 text-[#56736b]">WhatsApp should be open with your enquiry. If it did not open, use the direct contact below and Mangal will pick it up.</p>
                  <button type="button" data-testid="button-send-another-enquiry" onClick={() => setSent(false)} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold underline decoration-[#e75b3b] decoration-2 underline-offset-4">Send another enquiry <ArrowRight size={14} /></button>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="space-y-5">
                  <div className="flex items-start justify-between gap-4 border-b border-[#d9dfd2] pb-5">
                    <div><p className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-[#e75b3b]">Quick enquiry</p><h3 className="mt-2 font-display text-3xl leading-none">Where are you<br /><span className="italic">headed?</span></h3></div>
                    <Send size={21} className="mt-1 text-[#e75b3b]" />
                  </div>
                  <label className="block"><span className="mb-2 block text-xs font-extrabold">Your name</span><input name="name" required data-testid="input-enquiry-name" className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="What should we call you?" /></label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-xs font-extrabold">Dates</span><input name="dates" data-testid="input-enquiry-dates" className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="e.g. 12–18 October" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-extrabold">Group size</span><input name="group" data-testid="input-enquiry-group" className="w-full rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="e.g. 4 adults" /></label>
                  </div>
                  <label className="block"><span className="mb-2 block text-xs font-extrabold">I’m interested in</span><select name="interest" value={trip} onChange={(event) => setTrip(event.target.value)} data-testid="select-enquiry-interest" className="w-full appearance-none rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15"><option value="">A little bit of everything</option><option>Uttarakhand tours</option><option>Car rental</option><option>Bike or scooty rental</option><option>River rafting in Rishikesh</option><option>Custom route planning</option>{routes.map((route) => <option key={route.name}>{route.name}</option>)}</select></label>
                  <label className="block"><span className="mb-2 block text-xs font-extrabold">Anything to know?</span><textarea name="note" data-testid="input-enquiry-note" rows={3} className="w-full resize-none rounded-xl border border-[#cfd9cc] bg-[#f8f4e9] px-4 py-3 text-sm outline-none transition placeholder:text-[#8aa096] focus:border-[#e75b3b] focus:ring-2 focus:ring-[#e75b3b]/15" placeholder="Slow mornings, a short trek, temple visits, rafting..."></textarea></label>
                  <button type="submit" data-testid="button-submit-enquiry" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15322f] px-5 py-4 text-sm font-extrabold text-[#fffaf0] transition hover:bg-[#28534b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e75b3b] focus-visible:ring-offset-2">Open WhatsApp enquiry <ArrowRight size={16} /></button>
                  <p className="text-center font-mono-custom text-[9px] uppercase tracking-[0.13em] text-[#789087]">No booking form. Just a direct conversation.</p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#15322f] py-12 text-[#fffaf0]">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end">
            <div className="flex items-center gap-3"><LogoMark /><div><p className="text-sm font-extrabold tracking-[0.04em]">GARHWAL TOUR N ADVENTURE</p><p className="mt-1 text-xs text-[#b7ccc0]">Uttarakhand, India</p></div></div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-[#dce7dc]">
              {navItems.map((item) => <a key={item.href} href={item.href} data-testid={`link-footer-${item.label.toLowerCase().replaceAll(' ', '-')}`} className="transition hover:text-[#f8c75a]">{item.label}</a>)}
              <a href="tel:+918077016559" data-testid="link-footer-phone" className="transition hover:text-[#f8c75a]">+91 80770 16559</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-7 text-[10px] text-[#8eb0a0] sm:flex-row"><p>Built for the curious, by a local.</p><div className="flex items-center gap-5"><span>© {new Date().getFullYear()} Garhwal Tour N Adventure</span><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" data-testid="link-instagram" aria-label="Garhwal Tour N Adventure on Instagram" className="transition hover:text-[#f8c75a]"><Instagram size={15} /></a></div></div>
        </div>
      </footer>

      <button type="button" data-testid="button-floating-whatsapp" onClick={() => openWhatsApp('Namaste Mangal, I would like to plan a trip through Uttarakhand.')} aria-label="Open WhatsApp enquiry" className="whatsapp-pulse fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#2d9a62] text-white shadow-lg transition hover:scale-105 hover:bg-[#258653] md:bottom-7 md:right-7"><MessageCircle size={25} /></button>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;