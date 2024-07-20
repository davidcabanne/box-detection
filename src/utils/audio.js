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

const createImpulseResponse = (audioCtx, duration = 2, decay = 2) => {
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = length - i;
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
  }

  return impulse;
};

export const playNote = (audioCtxRef, frequency, panValue, gainValue) => {
  const audioCtx = audioCtxRef.current;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();
  const convolver = audioCtx.createConvolver();
  const dryGainNode = audioCtx.createGain();
  const wetGainNode = audioCtx.createGain();

  // Set the impulse response for the convolver node (reverb effect)
  convolver.buffer = createImpulseResponse(audioCtx);

  // Set the pan value
  panner.pan.setValueAtTime(panValue, audioCtx.currentTime);

  // Set the gain value based on combined pan and row values
  gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);

  // Set the wet/dry mix
  dryGainNode.gain.setValueAtTime(0.7, audioCtx.currentTime); // 70% dry signal
  wetGainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // 30% wet signal

  // Waveform type
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Connect nodes: oscillator -> gain -> panner
  oscillator.connect(gainNode);
  gainNode.connect(panner);

  // Connect dry path: panner -> dryGainNode -> destination
  panner.connect(dryGainNode);
  dryGainNode.connect(audioCtx.destination);

  // Connect wet path: panner -> convolver -> wetGainNode -> destination
  panner.connect(convolver);
  convolver.connect(wetGainNode);
  wetGainNode.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
  oscillator.stop(audioCtx.currentTime + 1);
};
