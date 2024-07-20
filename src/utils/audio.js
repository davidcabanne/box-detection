import { waveform } from "../constants";

export const initializeAudioContext = (audioCtxRef) => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
  } else if (audioCtxRef.current.state === "suspended") {
    audioCtxRef.current.resume();
  }
};

// Generates unique frequencies for each grid cell within a specified range
export const generateFrequencies = (numCols, numRows) => {
  const minFrequency = 220; // A3
  const maxFrequency = 880; // A5
  const numCells = numCols * numRows;
  const frequencies = [];

  for (let i = 0; i < numCells; i++) {
    // Normalized value between 0 and 1
    const ratio = i / (numCells - 1);
    const frequency =
      minFrequency * Math.pow(maxFrequency / minFrequency, ratio);
    frequencies.push(frequency);
  }

  // Reverse the order of frequencies
  return frequencies.reverse();
};

export const calculatePanValue = (col, numCols) => {
  // Maps col from [0, numCols-1] to [-1, 1]
  return (col / (numCols - 1)) * 2 - 1;
};

export const playNote = (audioCtxRef, frequency, panValue) => {
  const audioCtx = audioCtxRef.current;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();

  // Set the pan value
  panner.pan.setValueAtTime(panValue, audioCtx.currentTime);

  // Waveform type
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Set initial gain to a lower value to avoid clipping distortion
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

  // Connect nodes: oscillator -> gain -> panner -> destination
  oscillator.connect(gainNode);
  gainNode.connect(panner);
  panner.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
  oscillator.stop(audioCtx.currentTime + 1);
};
