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
  const panValue = (col / (numCols - 1)) * 2 - 1;
  return panValue;
};

export const calculateRowValue = (row, numRows) => {
  // Maps row from [0, numRows-1] to [-1, 1]
  const rowValue = (row / (numRows - 1)) * 2 - 1;
  return rowValue;
};

export const calculateGainValue = (panValue, rowValue) => {
  const minGain = 0.05; // Minimum gain on the sides
  const maxGain = 0.5; // Gain in the center

  // Calculate gain based on pan and row values
  const horizontalGain =
    minGain + (maxGain - minGain) * (1 - Math.abs(panValue));
  const verticalGain = minGain + (maxGain - minGain) * (1 - Math.abs(rowValue));

  // Combine the horizontal and vertical gains
  const gainValue = horizontalGain * verticalGain;

  return gainValue;
};

export const playNote = (audioCtxRef, frequency, panValue, gainValue) => {
  const audioCtx = audioCtxRef.current;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();

  // Set the pan value
  panner.pan.setValueAtTime(panValue, audioCtx.currentTime);

  // Set the gain value based on combined pan and row values
  gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);

  // Waveform type
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Connect nodes: oscillator -> gain -> panner -> destination
  oscillator.connect(gainNode);
  gainNode.connect(panner);
  panner.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
  oscillator.stop(audioCtx.currentTime + 1);
};
