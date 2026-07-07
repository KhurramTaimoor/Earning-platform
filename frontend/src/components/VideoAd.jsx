import React, { useEffect, useMemo, useState } from 'react';

const youtubeAds = [
  {
    tag: 'Funny YouTube Ad',
    title: 'Chai Break Video',
    text: 'Quick funny video ad. Chai pakro, ad dekho, phir task complete karo.',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    tag: 'Funny YouTube Ad',
    title: 'Mobile Load Mood',
    text: 'Mobile balance bachao aur tasks complete karo.',
    youtubeId: 'jNQXAC9IVRw',
  },
  {
    tag: 'Funny YouTube Ad',
    title: 'Wallet Smile Time',
    text: 'Wallet ko khush karne ka time aa gaya.',
    youtubeId: '9bZkp7q19f0',
  },
  {
    tag: 'Funny YouTube Ad',
    title: 'Task Break Video',
    text: 'Short entertainment break before next task.',
    youtubeId: 'kJQP7kiw5Fk',
  },
];

function getYoutubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&playsinline=1`;
}

export default function VideoAd() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const ad = useMemo(
    () => youtubeAds[currentIndex % youtubeAds.length],
    [currentIndex]
  );

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % youtubeAds.length);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextAd();
    }, 16000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="youtubeAdSection">
      <div className="youtubeAdHeader">
        <span>{ad.tag}</span>
        <h2>Watch a funny sponsored video</h2>
        <p>
          This video ad changes automatically. Users can also click next ad.
        </p>
      </div>

      <div className="youtubeAdCard">
        <div className="youtubeAdVideo">
          <iframe
            key={ad.youtubeId}
            src={getYoutubeEmbedUrl(ad.youtubeId)}
            title={ad.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="youtubeAdContent">
          <span className="youtubeAdBadge">{ad.tag}</span>

          <h3>{ad.title}</h3>

          <p>{ad.text}</p>

          <div className="youtubeAdActions">
            <button type="button" onClick={nextAd}>
              Next Video Ad
            </button>

            <small>
              Auto changing ad section
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
