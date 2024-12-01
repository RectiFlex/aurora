import { motion, useTransform } from 'framer-motion'

interface RobotIllustrationProps {
  mouseX: number
  mouseY: number
}

const RobotIllustration = ({ mouseX, mouseY }: RobotIllustrationProps) => {
  // Transform mouse position to rotation values
  const rotateX = useTransform(
    () => mouseY,
    [0, window.innerHeight],
    [15, -15]
  )
  
  const rotateY = useTransform(
    () => mouseX,
    [0, window.innerWidth],
    [-15, 15]
  )

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-[500px] h-[500px]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Robot Base */}
          <circle
            cx="200"
            cy="200"
            r="120"
            fill="url(#robotGradient)"
            className="stroke-2 stroke-purple-600 dark:stroke-purple-400"
          />

          {/* Robot Eyes */}
          <motion.circle
            cx="160"
            cy="160"
            r="20"
            className="fill-pink-500 dark:fill-pink-400"
            animate={{
              cx: 160 + (mouseX / window.innerWidth) * 10 - 5,
              cy: 160 + (mouseY / window.innerHeight) * 10 - 5,
            }}
          />
          <motion.circle
            cx="240"
            cy="160"
            r="20"
            className="fill-pink-500 dark:fill-pink-400"
            animate={{
              cx: 240 + (mouseX / window.innerWidth) * 10 - 5,
              cy: 160 + (mouseY / window.innerHeight) * 10 - 5,
            }}
          />

          {/* Mouth */}
          <motion.path
            d="M140,250 Q200,280 260,250"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="stroke-purple-600 dark:stroke-purple-400"
          />

          {/* Antenna */}
          <motion.line
            x1="200"
            y1="80"
            x2="200"
            y2="40"
            stroke="currentColor"
            strokeWidth="4"
            className="stroke-purple-600 dark:stroke-purple-400"
            animate={{
              transform: `rotate(${(mouseX / window.innerWidth - 0.5) * 30}deg)`,
              transformOrigin: '200px 80px',
            }}
          />
          <motion.circle
            cx="200"
            cy="35"
            r="8"
            className="fill-pink-500 dark:fill-pink-400"
            animate={{
              scale: 0.8 + (mouseX / window.innerWidth) * 0.4,
            }}
          />

          {/* Circuit Patterns */}
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={i}
              cx={200 + Math.cos(i * Math.PI / 3) * 140}
              cy={200 + Math.sin(i * Math.PI / 3) * 140}
              r="10"
              className="fill-purple-500/30 dark:fill-purple-400/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Gradient Definitions */}
          <defs>
            <radialGradient id="robotGradient">
              <stop offset="0%" className="stop-purple-600 dark:stop-purple-400" stopOpacity="0.2" />
              <stop offset="100%" className="stop-pink-600 dark:stop-pink-400" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  )
}

export default RobotIllustration