import { useGestureNavigation } from '../hooks/useGestureNavigation';
import '../styles/gesture-navigation.css';

export const GestureNavigationOverlay = () => {
  const { isGesturing, gestureProgress } = useGestureNavigation();

  if (!isGesturing || gestureProgress === 0) return null;

  return (
    <div className="gesture-overlay">
      <div 
        className={`gesture-indicator ${gestureProgress > 0 ? 'back' : 'forward'}`}
        style={{ 
          opacity: Math.abs(gestureProgress),
          transform: `translateX(${gestureProgress * 50}px)`
        }}
      >
        {gestureProgress > 0 ? '←' : '→'}
      </div>
    </div>
  );
}; 