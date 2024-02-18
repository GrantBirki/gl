import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

export default function ConfettiPop() {
  const { width, height } = useWindowSize();
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
