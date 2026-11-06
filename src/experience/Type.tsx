"use client";

import { Text } from "@react-three/drei";
import type { ComponentProps } from "react";

// Fonts are self-hosted (copied from @fontsource into /public/fonts) so the
// 3D signage never depends on a third-party CDN.
export const FONT_DISPLAY = "/fonts/instrument-serif-latin-400-normal.woff";
export const FONT_MONO = "/fonts/jetbrains-mono-latin-400-normal.woff";

type Props = ComponentProps<typeof Text>;

export function Display(props: Props) {
  return <Text font={FONT_DISPLAY} color="#E5E7EB" anchorX="center" anchorY="middle" letterSpacing={-0.02} {...props} />;
}

export function Mono(props: Props) {
  return (
    <Text
      font={FONT_MONO}
      color="#777D87"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.18}
      {...props}
    />
  );
}
