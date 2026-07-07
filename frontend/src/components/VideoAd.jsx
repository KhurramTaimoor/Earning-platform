import React, { useEffect, useMemo, useState } from 'react';

const funnyAds = [
  {
    tag: 'Funny Ad',
    title: 'Chai Break Bonus',
    text: 'Task complete karo warna chai bhi thandi aur wallet bhi khali.',
    punch: '☕ + 💸',
    emoji: '☕',
    cta: 'Earn Before Chai Gets Cold',
    theme: 'chai',
  },
  {
    tag: 'Sponsored Fun',
    title: 'Mobile Load Emergency',
    text: 'Friends se load mangna band karo. Tasks complete karo aur wallet grow karo.',
    punch: '📱 100 ka load?',
    emoji: '📱',
    cta: 'Save Your Mobile Balance',
    theme: 'mobile',
  },
  {
    tag: 'Task Ad',
    title: 'Wallet Ki Khushi',
    text: 'Wallet bol raha hai: “Bhai mujhe bhi thora full kar do.”',
    punch: 'Wallet wants attention',
    emoji: '💸',
    cta: 'Make Wallet Smile',
    theme: 'wallet',
  },
  {
    tag: 'Funny Sponsored',
    title: 'Screenshot Hero',
    text: 'Screenshot upload karo. Admin approve karega. Wallet bolega thank you.',
    punch: '📸 Proof Power',
    emoji: '📸',
    cta: 'Upload Like A Hero',
    theme: 'proof',
  },
  {
    tag: 'Daily Hustle',
    title: 'Kal Par Mat Choro',
    text: 'Aaj ka task aaj karo. Kal light bhi ja sakti hai aur mood bhi.',
    punch: '⚡ No excuses',
    emoji: '⚡',
    cta: 'Do Today’s Task',
    theme: 'light',
  },
  {
    tag: 'Funny Ad',
    title: 'Task Ninja Mode',
    text: 'Ad dekho, proof submit karo, aur ninja ki tarah next task par move karo.',
    punch: '🥷 Silent earning',
    emoji: '🥷',
    cta: 'Enter Ninja Mode',
    theme: 'ninja',
  },
  {
    tag: 'Sponsored',
    title: 'Internet Ka Faida',
    text: 'Sirf scroll karne se kuch nahi milta. Task complete karo, reward mil sakta hai.',
    punch: '🌐 Scroll less, earn more',
    emoji: '🌐',
    cta: 'Use Internet Smartly',
    theme: 'internet',
  },
];

function FunnyPoster({ ad, onNext }) {
  return (
    <button type="button" className={`funnyPoster funnyPoster-${ad.theme}`} onClick={onNext}>
      <div className="funnyPosterGlow" />
      <div className="funnyPosterEmoji">{ad.emoji}</div>
      <strong>{ad.punch}</strong>
      <span>Tap for next ad</span>
    </button>
  );
}

export default function VideoAd({ index = 0, size = 'large', rotate = true }) {
  const startIndex = index % funnyAds.length;
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const ad = useMemo(
    () => funnyAds[currentIndex % funnyAds.length],
    [currentIndex]
  );

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % funnyAds.length);
  }

  useEffect(() => {
    if (!rotate) return undefined;

    const timer = setInterval(() => {
      nextAd();
    }, 5500);

    return () => clearInterval(timer);
  }, [rotate]);

  return (
    <section className={`videoAd funnyVideoAd videoAd-${size}`}>
      <div className="videoAdBadge">{ad.tag}</div>

      <div className={`videoAdBox funnyAdBox funnyAdBox-${ad.theme}`}>
        <div className="videoAdMedia funnyAdMedia">
          <FunnyPoster ad={ad} onNext={nextAd} />
        </div>

        <div className="videoAdContent funnyAdContent">
          <h3>{ad.title}</h3>
          <p>{ad.text}</p>

          <div className="funnyAdActions">
            <span>{ad.cta}</span>

            <button type="button" className="videoAdNextBtn" onClick={nextAd}>
              Next Funny Ad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoAdsRow({ start = 3, count = 3 }) {
  const ads = funnyAds.slice(start, start + count);

  return (
    <section className="videoAdsRowSection funnyAdsRowSection">
      <div className="videoAdsRowHeader animate-up">
        <span>Funny Sponsored Ads</span>
        <h2>Small funny ads</h2>
        <p>Light, funny, and clean ad spaces for your earning platform.</p>
      </div>

      <div className="videoAdsRowGrid funnyAdsRowGrid">
        {ads.map((ad, index) => (
          <FunnyMiniCard
            ad={ad}
            key={`${ad.title}-${index}`}
            delay={index * 90}
            startIndex={start + index}
          />
        ))}
      </div>
    </section>
  );
}

function FunnyMiniCard({ ad, delay, startIndex }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex % funnyAds.length);
  const activeAd = funnyAds[currentIndex % funnyAds.length];

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % funnyAds.length);
  }

  useEffect(() => {
    const timer = setInterval(nextAd, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`videoAdMiniCard funnyMiniCard funnyMiniCard-${activeAd.theme} animate-card`}
      data-delay={delay}
    >
      <button type="button" className="funnyMiniPoster" onClick={nextAd}>
        <span>{activeAd.emoji}</span>
        <strong>{activeAd.punch}</strong>
      </button>

      <div className="videoAdMiniBody funnyMiniBody">
        <span>{activeAd.tag}</span>
        <h3>{activeAd.title}</h3>
        <p>{activeAd.text}</p>
      </div>
    </div>
  );
}
