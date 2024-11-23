/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 public/models/64f1a714fe61576b46f27ca2.glb -o src/components/Avatar.jsx -k -r public
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { useChat } from "../hooks/useChat";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    viseme_PP: 0.09564575641329172,
    viseme_TH: 0.14210517812412227,
    viseme_RR: 0.15,
    viseme_E: 0.17,
    viseme_O: 0.04736839270804076,
    mouthPucker: 0.67,
    noseSneerLeft: 1,
    mouthLowerDownLeft: 0.34,
    eyeLookInRight: 1,
    cheekPuff: 0.9,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthFunnel: 0.06,
    mouthDimpleLeft: 0.11990717351878255,
    mouthPressLeft: 0.63,
    mouthPressRight: 1,
    mouthSmileLeft: 0.0699458512192899,
    mouthSmileRight: 0.14
  },
  sad: {
    mouthFrownLeft: 0.60,
    mouthFrownRight: 0.60,
    mouthShrugLower: 0.41,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    browInnerUp: 0.9996566348450061,
    eyeWideLeft: 0.4996867106258911,
    eyeWideRight: 0.4996867106258911,
    mouthFunnel: 0.17
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 0.9999999941970116,
    eyeSquintLeft: 0.9999999983751632,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 0.22,
    mouthShrugLower: 0.872,
    noseSneerLeft: 0.6100000000000004,
    noseSneerRight: 0.6300000000000004,
    eyeLookDownLeft: 0.16000000197301611,
    eyeLookDownRight: 0.16000000197301611,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.14,
    mouthFunnel: 0.64,
    mouthDimpleRight: 0.59
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

export function Avatar(props) {
  const { nodes, materials, scene } = useGLTF(
    "/models/Alex.glb", true
  );

  const { message, onMessagePlayed, chat } = useChat();
  const [isTalking, setIsTalking] = useState(false);

  const [lipsync, setLipsync] = useState();

  useEffect(() => {
    console.log(message);
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setIsTalking(true);
    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
    return () => {
      setIsTalking(false);
      setAudio(null);
      setFacialExpression("smile");
    }
  }, [message]);

  const { animations } = useGLTF("/animations/animations.glb");

  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);
  const idleAnimations = ["Idle", "Idle", "Idle", "Idle_01", "Idle", "Idle", "Idle_02", "Idle", "Idle", "Idle_03", "Idle", "Idle", "Idle_04", "Idle", "Idle", "Idle_05", "Idle", "Idle", "Idle_06", "Idle", "Idle", "Idle_07", "Idle", "Idle", "Idle_08", "Idle", "Idle"];
  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name // Check if Idle animation exists otherwise use first animation
  );

  useEffect(() => {
    if (isTalking) return; // If talking, don't play idle animations
    let timeoutId;

    const getAnimationDuration = (animationName) => {
      const animationClip = animations.find((a) => a.name === animationName);
      return animationClip ? animationClip.duration * 1000 : 5000; // Default to 5000ms if not found
    };

    const playRandomAnimation = () => {
      if (isTalking) return; // If talking, don't play idle animations
      const randomAnimation = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      setAnimation(randomAnimation);
      const duration = getAnimationDuration(randomAnimation);
      timeoutId = setTimeout(playRandomAnimation, duration);
    };

    playRandomAnimation(); // Start the first animation

    return () => clearTimeout(timeoutId);
  }, [isTalking, animations]);

  useEffect(() => {
    actions[animation]
      .reset()
      .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
      .play();
    return () => actions[animation].fadeOut(0.5);
  }, [animation]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );

        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) { }
        }
      }
    });
  };

  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();

  useFrame(() => {
    !setupMode &&
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // LIPSYNC
    if (setupMode) {
      return;
    }

    const appliedMorphTargets = [];
    if (message && lipsync) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          appliedMorphTargets.push(corresponding[mouthCue.value]);
          lerpMorphTarget(corresponding[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations ? animations.map((a) => a.name) : [],
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      const emotionValues = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        const value =
          nodes.EyeLeft.morphTargetInfluences[
          nodes.EyeLeft.morphTargetDictionary[key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: nodes.EyeLeft.morphTargetInfluences[
              nodes.EyeLeft.morphTargetDictionary[key]
            ],
            max: 1,
            onChange: (val) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    )
  );

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);
  //     <group {...props} dispose={null} ref={group}>
  return (
    <group {...props} dispose={null} ref={group} position={[0, 0.1, -1]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload("/models/Vector.glb");
useGLTF.preload("/models/animations.glb");
