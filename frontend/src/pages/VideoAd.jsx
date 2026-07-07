import React, { useState } from 'react';

const videoAds = [
  {
    tag: 'Sponsored Video',
    title: 'Chai Break Bonus',
    text: 'Complete tasks before chai gets cold.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    emoji: '☕',
  },
  {
    tag: 'Video Ad',
    title: 'Mobile Balance Saver',
    text: 'Earn rewards and stop asking for mobile load.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    emoji: '📱',
  },
  {
    tag: 'Sponsored',
    title: 'Task Ninja Mode',
    text: 'Watch, submit proof, and earn approved rewards.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    emoji: '🥷',
  },
  {
    tag: 'Video Ad',
    title: 'Wallet Khush Hua',
    text: 'Your wallet wants more completed tasks.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    emoji: '💸',
  },
  {
    tag: 'Sponsored',
    title: 'Internet Ka Faida',
    text: 'Scrolling se behtar tasks complete karo.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    emoji: '🌐',
  },
  {
    tag: 'Video Ad',
    title: 'Proof Upload Hero',
    text: 'Screenshot upload karo aur approval ka wait karo.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    emoji: '📸',
  },
  {
    tag: 'Sponsored',
    title: 'Daily Hustle Reminder',
    text: 'Aaj ka task kal par mat choro.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    emoji: '⚡',
  },
];

function VideoBox({ ad }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="videoAdFallback">
        <div className="videoAdFallbackEmoji">{ad.emoji}</div>
        <span>Video Ad Space</span>
      </div>
    );
  }

  return (
    <video
      className="videoAdPlayer"
      src={ad.videoUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
    />
  );
}

export default function VideoAd({ index = 0, size = 'large' }) {
  const ad = videoAds[index % videoAds.length];

  return (
    <section className={`videoAd videoAd-${size}`}>
      <div className="videoAdBadge">{ad.tag}</div>

      <div className="videoAdBox">
        <div className="videoAdMedia">
          <VideoBox ad={ad} />

          <div className="videoAdPlay">
            <span>▶</span>
          </div>
        </div>

        <div className="videoAdContent">
          <h3>{ad.title}</h3>
          <p>{ad.text}</p>
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
          <div
            className="videoAdMiniCard animate-card"
            key={`${ad.title}-${index}`}
            data-delay={index * 90}
          >
            <div className="videoAdMiniMedia">
              <VideoBox ad={ad} />

              <div className="videoAdPlay mini">
                <span>▶</span>
              </div>
            </div>

            <div className="videoAdMiniBody">
              <span>{ad.tag}</span>
              <h3>{ad.title}</h3>
              <p>{ad.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
