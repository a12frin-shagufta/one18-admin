export const playOrderSound = () => {
  const audio = new Audio("/sounds/order.mp3");

  audio.volume = 0.8;

  audio.play().catch(err => {
    console.warn("Sound blocked until user interaction", err);
  });
};
