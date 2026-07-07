import React, { useEffect, useMemo, useState } from 'react';

const pakistaniFunnyAds = [
  {
    tag: 'Pakistani Funny Ad',
    title: 'Funniest Pakistani Ads',
    text: 'Pakistani TV ads ka funny collection. Light entertainment before tasks.',
    youtubeId: 'wmxXvLRGb74',
  },
  {
    tag: 'Ufone Funny Ad',
    title: 'Ufone Pakistani Funny Ad',
    text: 'Classic Pakistani funny ad style with local humor.',
    youtubeId: 'zsbWiaM7QTY',
  },
  {
    tag: 'Pakistani Funny Ad',
    title: 'Pakistani Ads Part 5',
    text: 'Funny Pakistani ad clips for a quick sponsored break.',
    youtubeId: 'x-v0tS0gLHI',
  },
  {
    tag: 'Funny Commercial',
    title: 'Pakistani Commercial Humor',
    text: 'Funny commercial style ad for your earning platform page.',
    youtubeId: 'mZO57_0H9Ug',
  },
  {
    tag: 'Funny Ad Break',
    title: 'Husband Wife Funny Ad',
    text: 'Funny South Asian commercial style ad break.',
    youtubeId: 'Rn7co3LQPi4',
  },
];

function getYoutubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&playsinline=1`;
}

export default function VideoAd() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const ad = useMemo(() => {
    return pakistaniFunnyAds[currentIndex % pakistaniFunnyAds.length];
  }, [currentIndex]);

  function nextAd() {
    setCurrentIndex((prev) => (prev + 1) % pakistaniFunnyAds.length);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextAd();
    }, 18000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pakistaniVideoAdSection">
      <div className="pakistaniVideoAdHeader">
        <span>Pakistani Funny Video Ad</span>

        <h2>Watch a funny sponsored ad</h2>

        <p>
          Funny Pakistani-style video ad section. Video changes automatically
          after a few seconds.
        </p>
      </div>

      <div className="pakistaniVideoAdCard">
        <div className="pakistaniVideoFrame">
          <iframe
            key={ad.youtubeId}
            src={getYoutubeEmbedUrl(ad.youtubeId)}
            title={ad.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="pakistaniVideoContent">
          <span>{ad.tag}</span>

          <h3>{ad.title}</h3>

          <p>{ad.text}</p>

          <div className="pakistaniVideoActions">
            <button type="button" onClick={nextAd}>
              Next Pakistani Ad
            </button>

            <small>Auto changing funny video ad</small>
          </div>
        </div>
      </div>
    </section>
  );
}
