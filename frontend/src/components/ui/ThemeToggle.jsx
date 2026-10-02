import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../store/DarkModeContext';

/**
 * ThemeToggle — a single animated Sun/Moon switch shared by the landing header
 * and the app navbar so both surfaces behave identically.
 *
 * The thumb slides across a pill track with a slight overshoot, the glyph inside
 * rotates and scales out while the other rotates and scales in, and the glyph
 * underneath hints at the mode you would switch to.
 */
export default function ThemeToggle({ className = '' }) {
  const { dark, toggleDark } = useDarkMode();

  const track =
    'relative inline-flex h-8 w-[62px] shrink-0 items-center rounded-full border p-1 ' +
    'transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-[#138808] ' +
    (dark
      ? 'border-white/15 bg-gradient-to-r from-[#0b1622] to-[#17233c] shadow-[inset_0_1px_3px_rgba(0,0,0,.55)]'
      : 'border-gray-200 bg-gradient-to-r from-[#fff9ef] to-[#edf3ff] shadow-[inset_0_1px_2px_rgba(15,23,42,.10)]');

  const thumb =
    'relative h-6 w-6 grid place-items-center rounded-full will-change-transform shadow-md ' +
    'transition-all duration-500 ' +
    (dark
      ? 'translate-x-[30px] bg-gradient-to-br from-[#2b3550] to-[#12192a] text-[#c8d0ff]'
      : 'translate-x-0 bg-gradient-to-br from-[#fffdf5] to-[#ffe0a8] text-[#dd8200]');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleDark}
      className={track + (className ? ' ' + className : '')}
      style={{ transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)' }}
    >
      {/* soft glow that follows the thumb */}
      <span
        aria-hidden="true"
        className={
          'pointer-events-none absolute top-1 h-6 w-6 rounded-full blur-[7px] transition-all duration-500 ' +
          (dark ? 'left-[30px] bg-[#7f8cff]/55' : 'left-0 bg-[#ffd066]/70')
        }
      />

      {/* the mode you can switch TO, shown on the free half of the track */}
      <Sun
        aria-hidden="true"
        className={
          'absolute right-[10px] h-3.5 w-3.5 transition-opacity duration-300 ' +
          (dark ? 'text-[#ffd066] opacity-45' : 'opacity-0')
        }
      />
      <Moon
        aria-hidden="true"
        className={
          'absolute left-[10px] h-3.5 w-3.5 transition-opacity duration-300 ' +
          (dark ? 'opacity-0' : 'text-[#94a3b8] opacity-45')
        }
      />

      {/* sliding thumb with the morphing glyph */}
      <span
        aria-hidden="true"
        className={thumb}
        style={{ transitionTimingFunction: 'cubic-bezier(.68,-.35,.27,1.35)' }}
      >
        <Sun
          className={
            'absolute h-4 w-4 transition-all duration-500 ' +
            (dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')
          }
        />
        <Moon
          className={
            'absolute h-4 w-4 transition-all duration-500 ' +
            (dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0')
          }
        />
      </span>
    </button>
  );
}
