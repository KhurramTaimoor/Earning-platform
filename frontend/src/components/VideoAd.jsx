import React, { useEffect, useMemo, useState } from 'react';

const pakistaniShortAds = [
  {
    tag: 'Pakistani Funny Short',
    title: 'Pakistani Ads Have No Logic',
    text: 'Funny Pakistani ad style short. Quick entertainment break before tasks.',
    youtubeId: 'yFwY2eA8yoo',
  },
  {
    tag: 'Funny Short Ad',
    title: 'Most Funny Pakistani TV Ads',
    text: 'Short Pakistani funny ad clip for a light sponsored break.',
    youtubeId: 'KSdnE9mvaaI',
  },
  {
    tag: 'Pakistani Ads',
    title: 'Pakistani Ads Short',
    text: 'Local Pakistani ad style short video for your platform.',
    youtubeId: 'lEqDJNN2tz0',
  },
  {
    tag: 'Comedy Ad Short',
    title: 'Servis Ad Funny Edition',
    text: 'Pakistani drama funny edition style short ad.',
    youtubeId: 'LS4jVnou3b0',
  },
  {
    tag: 'Funny Sponsored Short',
    title: 'Nawab Biryani Funny Ad',
    text: 'Pakistani funny ad short for quick entertainment.',
    youtubeId: 'co92exjbVdI',
  },
];

function getShortEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&playsinline=1`;
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
    <section className="shortsAdSection">
      <div className="shortsAdHeader">
        <span>Pakistani Funny Shorts Ad</span>

        <h2>Watch a short sponsored ad</h2>

        <p>
          Short Pakistani funny ads in mobile style. The ad changes automatically.
        </p>
      </div>

      <div className="shortsAdCard">
        <div className="shortsPhoneFrame">
          <div className="shortsPhoneTop">
            <span />
            <strong>Short Ad</strong>
            <span />
          </div>

          <div className="shortsVideoBox">
            <iframe
              key={ad.youtubeId}
              src={getShortEmbedUrl(ad.youtubeId)}
              title={ad.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="shortsAdContent">
          <span className="shortsAdBadge">{ad.tag}</span>

          <h3>{ad.title}</h3>

          <p>{ad.text}</p>

          <div className="shortsAdDots">
            {pakistaniShortAds.map((item, index) => (
              <button
                key={item.youtubeId}
                type="button"
                className={index === currentIndex ? 'active' : ''}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show ad ${index + 1}`}
              />
            ))}
          </div>

          <div className="shortsAdActions">
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
