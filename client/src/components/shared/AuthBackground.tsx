"use client";

import { useTheme } from "next-themes";
import Hyperspeed from "./HyperSpeed";

export function AuthBackground() {
  const { resolvedTheme} = useTheme()

  const colors = {
    light: {
      roadColor: 0xffffff,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0xffffff, 0xcccccc, 0xdddddd],
      rightCars: [0xffffff, 0xcccccc, 0xdddddd],
      sticks: 0xcccccc,
    },
    dark: {
      roadColor: 0x171a21,
      islandColor: 0x23252b,
      background: 0x06070a,
      shoulderLines: 0x7a8a97,
      brokenLines: 0x465464,
      leftCars: [0x24354a, 0x4a3650, 0x29494b],
      rightCars: [0x474b54, 0x283247, 0x474b4f],
      sticks: 0x222b3a,
    },
  }

  return (
    <div className="absolute -left-1/2 -translate-y-1/2 w-full h-full inset-0 overflowhidden opacity-40 dark:opacity-30">
      {/* <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10" /> */}
      <Hyperspeed
        effectOptions={{
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 90,
          speedUp: 0,
          colors: resolvedTheme === 'light' ? colors.light : colors.dark,
          //other speeding for smoother

          carLightsFade: 0.85,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          movingAwaySpeed: [1, 5],
          movingCloserSpeed: [-1, -5],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
        }}
      />
    </div>
  );
}

{
  /* <div className="absolute inset-0 opacity-30">
        <Hyperspeed
          effectOptions={{
            distortion: "turbulentDistortion",
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 0,
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0xffffff,
              brokenLines: 0xffffff,
              leftCars: [0x333333, 0x444444, 0x555555],
              rightCars: [0x333333, 0x444444, 0x555555],
              sticks: 0x444444,
            },
          }}
        />
      </div> */
}
