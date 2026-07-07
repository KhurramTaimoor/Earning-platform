import React, { useEffect, useMemo, useState } from 'react';

const pakistaniShortAds = [
  {
    tag: 'Pakistani Funny Short',
    title: 'Pakistani Funny Ad',
    text: 'Quick Pakistani funny short ad for a light entertainment break.',
    youtubeId: 'yFwY2eA8yoo',
  },
  {
    tag: 'Funny Short',
    title: 'Funny Pakistani TV Ad',
    text: 'A short sponsored video ad in Pakistani funny style.',
    youtubeId: 'KSdnE9mvaaI',
  },
  {
    tag: 'Short Ad',
    title: 'Pakistani Comedy Ad',
    text: 'Small funny ad break before users continue browsing.',
    youtubeId: 'lEqDJNN2tz0',
  },
  {
    tag: 'Comedy Short',
    title: 'Servis Funny Edition',
    text: 'Pakistani ad style short video for a clean ad section.',
    youtubeId: 'LS4jVnou3b0',
  },
  {
    tag: 'Sponsored Short',
    title: 'Funny Local Ad',
    text: 'Short mobile-style sponsored ad for BMS EarnHub.',
    youtubeId: 'co92exjbVdI',
  },
];

function getYoutubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
}

export default function VideoAd() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const ad = useMemo(() => {
    return pakistaniShortAds[currentIndex % pakistaniShortAds.length];
  }, [currentIndex]);

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % pakistaniShortAds.length);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextAd();
    }, 14000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bmsShortsAdSection">
      <div className="bmsShortsAdHeader">
        <span>Pakistani Funny Shorts Ad</span>
        <h2>Watch a short sponsored ad</h2>
        <p>Short Pakistani funny ads in mobile style. The ad changes automatically.</p>
      </div>

      <div className="bmsShortsAdCard">
        <div className="bmsShortsPhone">
          <div className="bmsShortsPhoneTop">
            <span />
            <strong>BMS Short Ad</strong>
            <span />
          </div>

          <div className="bmsShortsVideo">
            <iframe
              key={ad.youtubeId}
              src={getYoutubeEmbedUrl(ad.youtubeId)}
              title={ad.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="bmsShortsAdContent">
          <span className="bmsShortsBadge">{ad.tag}</span>

          <h3>{ad.title}</h3>

          <p>{ad.text}</p>

          <div className="bmsShortsDots">
            {pakistaniShortAds.map((item, index) => (
              <button
                key={item.youtubeId}
                type="button"
                className={index === currentIndex ? 'active' : ''}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show short ad ${index + 1}`}
              />
            ))}
          </div>

          <div className="bmsShortsActions">
            <button type="button" onClick={nextAd}>
              Next Short Ad
            </button>

            <small>Auto changing every few seconds</small>
          </div>
        </div>
      </div>
    </section>
  );
}
