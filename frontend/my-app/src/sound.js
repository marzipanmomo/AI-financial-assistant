import clickSound from "./button.wav";

const clickAudio = new Audio(clickSound);

export const playClick = () => {
  clickAudio.currentTime = 0;
  clickAudio.play();
};
