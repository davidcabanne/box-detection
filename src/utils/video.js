import { calculatePanValue } from "./audio";
export const detectMovement = (
  videoRef,
  canvasRef,
  gridRef,
  prevOccupancy,
  frequencies,
  playNote,
  activeColor,
  initialColor,
  audioCtxRef
) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (videoRef.current.paused || videoRef.current.ended) {
    return;
  }

  // Draw the current video frame onto the canvas
  context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const length = frame.data.length / 4;

  // Current frame's occupancy status
  const currentOccupancy = Array(prevOccupancy.length).fill(false);

  // Loop through the pixel data to detect dark areas
  for (let i = 0; i < length; i++) {
    const red = frame.data[i * 4];
    const green = frame.data[i * 4 + 1];
    const blue = frame.data[i * 4 + 2];

    if (red + green + blue < 200) {
      const x = i % canvas.width;
      const y = Math.floor(i / canvas.width);

      const col = Math.floor(
        x / (canvas.width / Math.sqrt(prevOccupancy.length))
      );
      const row = Math.floor(
        y / (canvas.height / Math.sqrt(prevOccupancy.length))
      );

      const index = row * Math.sqrt(prevOccupancy.length) + col;
      currentOccupancy[index] = true;
    }
  }

  // Update the grid and play notes based on the current frame's occupancy
  currentOccupancy.forEach((isOccupied, index) => {
    if (isOccupied) {
      if (!prevOccupancy[index]) {
        gridRef.current[index].style.background = `${activeColor}`;
        const col = index % Math.sqrt(prevOccupancy.length);
        const panValue = calculatePanValue(
          col,
          Math.sqrt(prevOccupancy.length)
        );
        playNote(audioCtxRef, frequencies[index], panValue);
      }
    } else {
      if (prevOccupancy[index]) {
        gridRef.current[index].style.background = `${initialColor}`;
      }
    }
  });

  // Update previous occupancy status for the next frame
  for (let i = 0; i < prevOccupancy.length; i++) {
    prevOccupancy[i] = currentOccupancy[i];
  }

  // Request the next frame for processing
  requestAnimationFrame(() =>
    detectMovement(
      videoRef,
      canvasRef,
      gridRef,
      prevOccupancy,
      frequencies,
      playNote,
      activeColor,
      initialColor,
      audioCtxRef
    )
  );
};
