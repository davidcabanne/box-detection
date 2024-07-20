import { useEffect, useRef } from "react";
import video from "/video.mp4";

import Main from "./components/Main";
import Grid from "./components/Grid";
import {
  columns,
  initialColor,
  activeColor,
  canvasWidth,
  canvasHeight,
} from "./constants";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const audioCtxRef = useRef(null);

  const numCols = columns;
  const numRows = numCols;

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    // Previous frame's occupancy status
    const prevOccupancy = Array(numCols * numRows).fill(false);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // initialize and resume the AudioContext
    const initializeAudioContext = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    // Generate different frequencies for each grid cell
    const frequencies = [...Array(numCols * numRows)].map(
      (_, idx) => 220 + idx * 10
    );

    // handle playing sound note
    const playNote = (frequency) => {
      const audioCtx = audioCtxRef.current;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // waveform type
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      // Set initial gain to a lower value to avoid clipping distortion
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioCtx.currentTime + 1
      );
      oscillator.stop(audioCtx.currentTime + 1);
    };

    // handle detecting movement
    const detectMovement = () => {
      if (video.paused || video.ended) {
        return;
      }

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
      const frame = context.getImageData(0, 0, canvasWidth, canvasHeight);
      const length = frame.data.length / 4;

      // Current frame's occupancy status
      const currentOccupancy = Array(numCols * numRows).fill(false);

      // Loop through the pixel data to detect dark areas
      for (let i = 0; i < length; i++) {
        const red = frame.data[i * 4];
        const green = frame.data[i * 4 + 1];
        const blue = frame.data[i * 4 + 2];

        if (red + green + blue < 200) {
          const x = i % canvasWidth;
          const y = Math.floor(i / canvasWidth);

          const col = Math.floor(x / (canvasWidth / numCols));
          const row = Math.floor(y / (canvasHeight / numRows));

          const index = row * numCols + col;
          currentOccupancy[index] = true;
        }
      }

      // Update the grid and play notes based on the current frame's occupancy
      currentOccupancy.forEach((isOccupied, index) => {
        if (isOccupied) {
          if (!prevOccupancy[index]) {
            gridRef.current[index].style.background = `${activeColor}`;
            playNote(frequencies[index]);
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
      requestAnimationFrame(detectMovement);
    };

    // Add an event listener to start detecting movement when the video plays
    video.addEventListener("play", () => {
      initializeAudioContext(); // Initialize the AudioContext on play
      detectMovement();
    });

    // Cleanup event listener on component unmount
    return () => {
      video.removeEventListener("play", () => {
        initializeAudioContext();
        detectMovement();
      });
    };
  }, [numCols, numRows]);

  return (
    <Main>
      <video
        ref={videoRef}
        width={canvasWidth}
        height={canvasHeight}
        controls
        muted
        loop
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Grid
        numCols={numCols}
        numRows={numRows}
        ref={gridRef}
        initialColor={initialColor}
        activeColor={activeColor}
      />
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </Main>
  );
}

export default App;
