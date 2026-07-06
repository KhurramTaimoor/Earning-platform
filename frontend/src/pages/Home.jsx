import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const MOBILE_WALLET_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3t9FGYYn7A_nM5QjCQBR-iVC0am324Bpqva_JUvrxzA&s=10';

const LOCAL_BUSINESS_TASK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdaPQ3AchWTVkpW6ugw78oFJT01wmKseyHvr-BljIxdw&s=10';

const PAKISTANI_MARKET_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzR9-QmCu12WdBQkLXPGUWT00htW0P71vmJQt__1vcTw&s=10';

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

/**
 * Scroll-triggers the existing .animate-up / .animate-card keyframes.
 * Both classes start at opacity:0 in the stylesheet; this hook adds
 * .in-view (which is what actually plays the `fadeUp` animation) the
 * moment an element enters the viewport, with an optional stagger
 * driven by each element's data-delay attribute.
 */
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
    </main>
  );
}

