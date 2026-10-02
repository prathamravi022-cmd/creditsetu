import { useRef } from 'react'
import useIsomorphicScale from '../../hooks/useIsomorphicScale'

const ScaleCard = ({ children, className = '', ...rest }) => {
  const ref = useRef(null)
  const scale = useIsomorphicScale(ref)
  const scaleX = 1 + (scale - 1) * 1.2
  const scaleY = 1 + (scale - 1)
  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ transform: `scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)` }}
      {...rest}
    >
      {children}
    </div>
  )
}

export default ScaleCard
