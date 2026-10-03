import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { getWindowSize, subscribeToWindowSize } from '../../utils/window-size.mjs';

export default function ConfettiPop() {
  const [{ width, height }, setSize] = useState(getWindowSize);
  useEffect(() => subscribeToWindowSize(setSize), []);
  return (
    <Confetti
      width={width}
      height={height}
      friction={0.99}
      gravity={0.2}
      recycle={false}
      numberOfPieces={600}
      tweenDuration={15000}
    />
  );
}
