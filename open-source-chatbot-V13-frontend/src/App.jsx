import React from "react";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import "./index.css"; // Ensure your styles are properly imported
import videoSrc from "/bg1.mp4"; // Adjust this path

function App() {
  return (
    <>
      {/* Video Background */}
      <video className="video-bg" autoPlay muted loop>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 3D Scene and UI */}
      <Loader />
      <Leva />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 50 }}>
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
