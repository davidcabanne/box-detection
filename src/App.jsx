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

import {
  initializeAudioContext,
  generateFrequencies,
  playNote,
  detectMovement,
} from "./utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const audioCtxRef = useRef(null);

  const numCols = columns;
  const numRows = numCols;
  const frequencies = generateFrequencies(numCols, numRows);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Add an event listener to start detecting movement when the video plays
    const video = videoRef.current;
    video.addEventListener("play", handleVideoPlay);

    // Cleanup event listener on component unmount
    return () => {
      video.removeEventListener("play", handleVideoPlay);
    };
  }, [numCols, numRows, frequencies]);

  const handleVideoPlay = () => {
    initializeAudioContext(audioCtxRef);
    const prevOccupancy = Array(numCols * numRows).fill(false);
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
    );
  };

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
