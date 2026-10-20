'use strict';
const previews = {
  note: { kicker: 'A FEW WORDS GO A LONG WAY', title: 'Your words.\nTheir next smile.', description: "A good morning. A good luck. A reminder that they're on your mind. Pair a photo with a little note and turn it into something they'll see when they reach for their phone.", image: 'coffee-date.webp', message: 'Coffee date?', detail: 'You, me & no plans.', label: 'Illustrative Android lock screen with picnic coffees and the note Coffee date? You, me and no plans.', caption: 'Example: a coffee photo + your little note' },
  photo: { kicker: 'THE MOMENTS WORTH SHARING', title: 'Your favourite view.\nSent with love.', description: 'A beach-day grin. Your favourite four-legged friend. A little moment worth sharing. Choose a photo or take a new one, then send a smile to their lock screen.', image: 'beach-dog.webp', message: 'Wish you were here!', detail: '', label: 'Illustrative Android lock screen showing a playful golden retriever on the beach with the note Wish you were here.', caption: 'Example: a beach-day photo to brighten their screen' },
  doodle: { kicker: 'PERFECTLY IMPERFECT', title: 'A little scribble.\nA lot of you.', description: "Give your favourite photo a little extra personality. Draw a wobbly heart, add a silly caption and send something only you would make. No artistic talent required.", image: 'beach-dog.webp', message: '10/10 good boy', detail: 'would boop again ♡', label: 'Illustrative Android lock screen with a golden retriever photo, a hand-drawn heart, and the caption 10 out of 10 good boy, would boop again.', caption: 'Example: a photo + a doodle + one very good boy' }
};
const buttons = document.querySelectorAll('[data-view]');
buttons.forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.view;
  const view = previews[key];
  if (!view) return;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('view-kicker').textContent = view.kicker;
  const title = document.getElementById('view-title');
  title.replaceChildren();
  view.title.split('\n').forEach((line, index) => {
    if (index) title.append(document.createElement('br'));
    title.append(document.createTextNode(line));
  });
  document.getElementById('view-description').textContent = view.description;
  document.getElementById('wallpaper-photo').src = 'images/' + view.image;
  const screen = document.getElementById('lock-preview');
  screen.className = 'lock-phone interactive-lock example-' + key;
  screen.setAttribute('aria-label', view.label);
  const message = document.getElementById('wallpaper-message');
  message.replaceChildren(document.createTextNode(view.message));
  if (view.detail) {
    const detail = document.createElement('small');
    detail.textContent = view.detail;
    message.append(detail);
  }
  document.getElementById('wallpaper-doodle').hidden = key !== 'doodle';
  document.getElementById('example-caption').textContent = view.caption;
}));

// Controls for the real GIF asset; reduced-motion visitors see the static frame.
(() => {
  const image = document.getElementById('live-game-animation');
  const controls = document.querySelector('.live-game-controls');
  if (!image || !controls) return;
  const toggle = document.getElementById('toggle-live-game');
  const replay = document.getElementById('replay-live-game');
  const caption = document.querySelector('.live-illustration-caption');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gif = image.dataset.animation;
  const still = image.dataset.still;
  let animationUrl = gif;
  let blobUrl = null;
  let blobPromise = null;
  let replayVersion = 0;
  let manuallyStopped = false;
  let inView = !('IntersectionObserver' in window);

  function updatePlayback() {
    const playing = inView && !manuallyStopped && !motion.matches && !document.hidden;
    const source = playing ? animationUrl : still;
    if (image.getAttribute('src') !== source) image.src = source;
    toggle.textContent = manuallyStopped ? 'Play animation' : 'Stop animation';
    toggle.setAttribute('aria-pressed', String(manuallyStopped));
  }
  function configureMotion() {
    controls.hidden = motion.matches;
    caption.textContent = (motion.matches ? 'Illustration' : 'Animated GIF illustration') + ' of shared strokes on two phones, not an app screenshot.';
    updatePlayback();
  }
  toggle.addEventListener('click', () => {
    manuallyStopped = !manuallyStopped;
    updatePlayback();
  });
  replay.addEventListener('click', async () => {
    const version = ++replayVersion;
    manuallyStopped = false;
    try {
      if (!blobPromise) blobPromise = fetch(gif).then(response => {
        if (!response.ok) throw new Error('GIF unavailable');
        return response.blob();
      }).catch(error => { blobPromise = null; throw error; });
      const blob = await blobPromise;
      if (version !== replayVersion) return;
      const oldUrl = blobUrl;
      blobUrl = URL.createObjectURL(blob);
      animationUrl = blobUrl;
      updatePlayback();
      if (oldUrl) URL.revokeObjectURL(oldUrl);
    } catch {
      animationUrl = gif;
      updatePlayback();
    }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updatePlayback();
    }, { threshold: 0.15 });
    observer.observe(image);
  }
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', configureMotion);
  configureMotion();
})();
