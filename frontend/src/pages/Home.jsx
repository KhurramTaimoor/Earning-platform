import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoAd, { VideoAdsRow } from '../components/VideoAd.jsx';

const WHATSAPP_NUMBER_DISPLAY = '034151764474';
const WHATSAPP_NUMBER_LINK = '9234151764474';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Assalam o Alaikum, I want to know more about BMS EarnHub.'
);

const MOBILE_WALLET_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3t9FGYYn7A_nM5QjCQBR-iVC0am324Bpqva_JUvrxzA&s=10';

const LOCAL_BUSINESS_TASK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdaPQ3AchWTVkpW6ugw78oFJT01wmKseyHvr-BljIxdw&s=10';

const PAKISTANI_MARKET_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzR9-QmCu12WdBQkLXPGUWT00htW0P71vmJQt__1vcTw&s=10';

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_LINK}?text=${WHATSAPP_MESSAGE}`;

const packages = [
  { name: 'Starter', price: 500, limit: 150, tasks: 'Basic task access' },
  { name: 'Bronze', price: 1000, limit: 300, tasks: 'More daily tasks' },
  { name: 'Silver', price: 2000, limit: 600, tasks: 'Higher earning limit' },
  { name: 'Gold', price: 3000, limit: 900, tasks: 'Premium task access' },
  { name: 'Platinum', price: 4000, limit: 1200, tasks: 'Advanced earning access' },
  { name: 'Diamond', price: 5000, limit: 1500, tasks: 'Maximum task limit' },
];

const steps = [
  {
    number: '01',
    title: 'Create Account',
    text: 'Register your BMS EarnHub account and login to your dashboard.',
  },
  {
    number: '02',
    title: 'Activate Package',
    text: 'Choose a package and submit payment proof for admin approval.',
  },
  {
    number: '03',
    title: 'Complete Tasks',
    text: 'Watch ads, complete simple tasks, and submit proof.',
  },
  {
    number: '04',
    title: 'Withdraw Daily',
    text: 'Request withdrawal once a day after your balance is available.',
  },
];

const marketCards = [
  {
    title: 'Mobile Wallet Payments',
    text: 'Support JazzCash, Easypaisa, bank transfer, and manual payment proof.',
    img: MOBILE_WALLET_IMAGE,
  },
  {
    title: 'Local Business Tasks',
    text: 'Users can complete ad views, shop visits, app installs, and simple online tasks.',
    img: LOCAL_BUSINESS_TASK_IMAGE,
  },
  {
    title: 'Pakistani Local Market',
    text: 'A local earning platform style for users, advertisers, and admin management.',
    img: PAKISTANI_MARKET_IMAGE,
  },
];

function SafeImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.currentTarget.src =
          'https://placehold.co/900x700/eef4ff/172554?text=BMS+EarnHub';
      }}
    />
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.02 3.2C8.96 3.2 3.22 8.9 3.22 15.92c0 2.25.6 4.45 1.74 6.38L3.1 29.1l6.98-1.83a12.8 12.8 0 0 0 5.94 1.5h.01c7.06 0 12.8-5.7 12.8-12.72S23.08 3.2 16.02 3.2Zm0 23.42h-.01a10.66 10.66 0 0 1-5.42-1.48l-.39-.23-4.14 1.08 1.1-4.02-.26-.41a10.5 10.5 0 0 1-1.61-5.64c0-5.84 4.8-10.6 10.73-10.6 2.86 0 5.56 1.1 7.58 3.1a10.5 10.5 0 0 1 3.15 7.53c0 5.84-4.81 10.6-10.73 10.6Zm5.88-7.94c-.32-.16-1.9-.93-2.2-1.04-.29-.1-.5-.16-.72.16-.21.32-.83 1.04-1.02 1.25-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.58-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.72-.99-2.36-.26-.62-.52-.53-.72-.54h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67s1.15 3.1 1.31 3.31c.16.21 2.27 3.45 5.5 4.84.77.33 1.37.53 1.83.68.77.24 1.47.21 2.03.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"
      />
    </svg>
  );
}

function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const targets = Array.from(
      root.querySelectorAll('.animate-up, .animate-card')
    );

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in-view'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-delay') || '0';
            el.style.animationDelay = `${delay}ms`;
            el.classList.add('in-view');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootRef]);
}

export default function Home() {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  return (
    <main className="home-page" ref={pageRef}>
      <a
        href={WHATSAPP_URL}
        className="whatsappFloat"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>

      <section className="hero-section">
        <div className="hero-content animate-up">
          <span className="hero-badge">BMS EarnHub Pakistan</span>

          <h1>
            Complete tasks,
            <br />
            watch ads, and
            <br />
            earn rewards.
          </h1>

          <p>
            Activate a package, unlock daily earning opportunities, complete
            simple tasks, submit proof, and withdraw once per day after admin
            approval.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-btn">
              Create Account
            </Link>

            <Link to="/login" className="secondary-btn">
              Login
            </Link>
          </div>
        </div>

        <div className="pakMarketVisual animate-float">
          <div className="marketImage mainMarketImage">
            <SafeImage
              src={PAKISTANI_MARKET_IMAGE}
              alt="Pakistani local market"
            />
          </div>

          <div className="floatingWalletCard">
            <span>Today Earning</span>
            <h3>PKR 1,500</h3>
            <p>Diamond daily limit</p>
          </div>

          <div className="floatingTaskCard">
            <strong>12+</strong>
            <span>Daily Tasks</span>
          </div>
        </div>
      </section>

      <VideoAd index={0} size="large" />

      <section className="how-section">
        <div className="section-heading animate-up">
          <span>How It Works</span>
          <h2>Start earning in four simple steps</h2>
          <p>
            BMS EarnHub gives users earning opportunities through ads and simple
            task completion.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div
              className="step-card animate-card"
              key={step.number}
              data-delay={i * 90}
            >
              <strong>{step.number}</strong>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <VideoAd index={1} size="small" />

      <section className="market-section">
        <div className="section-heading animate-up">
          <span>Pakistani Market</span>
          <h2>Built for local earning and task business</h2>
          <p>
            The platform can connect users, advertisers, and local businesses
            through approved tasks and wallet-based rewards.
          </p>
        </div>

        <div className="market-grid">
          {marketCards.map((item, i) => (
            <div
              className="market-card animate-card"
              key={item.title}
              data-delay={i * 110}
            >
              <div className="market-card-img">
                <SafeImage src={item.img} alt={item.title} />
              </div>

              <div className="market-card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <VideoAd index={2} size="large" />

      <section className="packages-section">
        <div className="section-heading animate-up">
          <span>Packages</span>
          <h2>Choose a tier and unlock tasks</h2>
          <p>
            Each tier gives a higher daily task earning limit. Earnings depend
            on approved completed tasks.
          </p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, i) => (
            <div
              className="package-card animate-card"
              key={pkg.name}
              data-delay={(i % 3) * 100}
            >
              <div className="package-top">
                <h3>{pkg.name}</h3>
                <span>PKR {pkg.price}</span>
              </div>

              <p>Daily earning limit</p>
              <h2>Up to PKR {pkg.limit}</h2>

              <div className="package-info">
                <p>{pkg.tasks}</p>
                <p>Task proof required</p>
                <p>Admin approval system</p>
              </div>

              <Link to="/register" className="package-link">
                Activate Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      <VideoAdsRow start={3} count={3} />

      <section className="features-section">
        <div className="feature-box animate-card" data-delay="0">
          <h3>User Dashboard</h3>
          <p>
            Users can view active package, daily limit, wallet balance, tasks,
            payments, and withdrawals.
          </p>
        </div>

        <div className="feature-box animate-card" data-delay="90">
          <h3>Wallet System</h3>
          <p>
            Approved task rewards are added to wallet. Withdrawals are allowed
            once per day.
          </p>
        </div>

        <div className="feature-box animate-card" data-delay="180">
          <h3>Secure Approval</h3>
          <p>
            Payment proofs, task proofs, and withdrawals are manually approved
            before balance changes.
          </p>
        </div>
      </section>

      <VideoAd index={6} size="small" />

      <section className="cta-section animate-up">
        <h2>Ready to start with BMS EarnHub?</h2>
        <p>
          Create your account, activate your package, and start completing
          approved tasks.
        </p>

        <Link to="/register" className="primary-btn">
          Get Started
        </Link>
      </section>

      <footer className="homeFooter">
        <div className="homeFooterInner">
          <div>
            <h3>BMS EarnHub</h3>
            <p>
              Pakistan based task earning platform with package activation,
              task proof, wallet, and manual approval system.
            </p>
          </div>

          <div className="footerContactBox">
            <span>Contact on WhatsApp</span>

            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              {WHATSAPP_NUMBER_DISPLAY}
            </a>
          </div>
        </div>

        <div className="homeFooterBottom">
          <p>© {new Date().getFullYear()} BMS EarnHub. All rights reserved.</p>

          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            WhatsApp Support
          </a>
        </div>
      </footer>
    </main>
  );
}
