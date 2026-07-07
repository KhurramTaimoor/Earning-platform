import React, { useEffect, useMemo, useState } from 'react';

const videoAds = [
  {
    tag: 'Video Ad',
    title: 'Mobile Balance Saver',
    text: 'Earn rewards and stop asking for mobile load.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    emoji: '📱',
  },
  {
    tag: 'Sponsored',
    title: 'Task Ninja Mode',
    text: 'Watch, submit proof, and earn approved rewards.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    emoji: '🥷',
  },
  {
    tag: 'Video Ad',
    title: 'Wallet Khush Hua',
    text: 'Your wallet wants more completed tasks.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    emoji: '💸',
  },
  {
    tag: 'Sponsored',
    title: 'Internet Ka Faida',
    text: 'Scrolling se behtar tasks complete karo.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    emoji: '🌐',
  },
  {
    tag: 'Video Ad',
    title: 'Proof Upload Hero',
    text: 'Screenshot upload karo aur approval ka wait karo.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    emoji: '📸',
  },
  {
    tag: 'Sponsored',
    title: 'Daily Hustle Reminder',
    text: 'Aaj ka task kal par mat choro.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    emoji: '⚡',
  },
  {
    tag: 'Video Ad',
    title: 'Chai Break Bonus',
    text: 'Complete tasks before chai gets cold.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    emoji: '☕',
  },
];

function VideoBox({ ad, onNext }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [ad.videoUrl]);

  if (failed) {
    return (
      <button type="button" className="videoAdFallback" onClick={onNext}>
        <div className="videoAdFallbackEmoji">{ad.emoji}</div>
        <span>Loading next ad...</span>
      </button>
    );
  }

  return (
    <video
      key={ad.videoUrl}
      className="videoAdPlayer"
      src={ad.videoUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onEnded={onNext}
      onError={() => {
        setFailed(true);
        setTimeout(onNext, 900);
      }}
    />
  );
}

export default function VideoAd({ index = 0, size = 'large', rotate = true }) {
  const startIndex = index % videoAds.length;
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const ad = useMemo(() => videoAds[currentIndex % videoAds.length], [currentIndex]);

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % videoAds.length);
  }

  useEffect(() => {
    if (!rotate) return undefined;

    const timer = setInterval(() => {
      nextAd();
    }, 8000);

    return () => clearInterval(timer);
  }, [rotate]);

  return (
    <section className={`videoAd videoAd-${size}`}>
      <div className="videoAdBadge">{ad.tag}</div>

      <div className="videoAdBox">
        <div className="videoAdMedia">
          <VideoBox ad={ad} onNext={nextAd} />

          <div className="videoAdPlay">
            <span>▶</span>
          </div>
        </div>

        <div className="videoAdContent">
          <h3>{ad.title}</h3>
          <p>{ad.text}</p>

          <button type="button" className="videoAdNextBtn" onClick={nextAd}>
            Next Ad
          </button>
        </div>
      </div>
    </section>
  );
}

export function VideoAdsRow({ start = 3, count = 3 }) {
  const ads = videoAds.slice(start, start + count);

  return (
    <section className="videoAdsRowSection">
      <div className="videoAdsRowHeader animate-up">
        <span>Sponsored Videos</span>
        <h2>Watch small video ads</h2>
        <p>Short video ad spaces for promotions and sponsored content.</p>
      </div>

      <div className="videoAdsRowGrid">
        {ads.map((ad, index) => (
          <VideoMiniCard ad={ad} key={`${ad.title}-${index}`} delay={index * 90} />
        ))}
      </div>
    </section>
  );
}

function VideoMiniCard({ ad, delay }) {
  const [currentIndex, setCurrentIndex] = useState(
    videoAds.findIndex((item) => item.title === ad.title)
  );

  const activeAd = videoAds[currentIndex >= 0 ? currentIndex : 0];

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % videoAds.length);
  }

  useEffect(() => {
    const timer = setInterval(nextAd, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="videoAdMiniCard animate-card" data-delay={delay}>
      <div className="videoAdMiniMedia">
        <VideoBox ad={activeAd} onNext={nextAd} />

        <div className="videoAdPlay mini">
          <span>▶</span>
        </div>
      </div>

      <div className="videoAdMiniBody">
        <span>{activeAd.tag}</span>
        <h3>{activeAd.title}</h3>
        <p>{activeAd.text}</p>
      </div>
    </div>
  );
}
