'use client';

export default function CircularProgress({ progress = 0, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clamped / 100) * circumference;

  // Couleur: interpolation simple entre rouge et vert
  const startColor = { r: 220, g: 38, b: 38 };   // #dc2626
  const endColor = { r: 22, g: 163, b: 74 };     // #16a34a
  const t = clamped / 100;
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);
  const strokeColor = `rgb(${r}, ${g}, ${b})`;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.1s linear, stroke 0.2s linear',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '24px',
          color: '#0f172a',
        }}
      >
        {clamped}%
      </div>
    </div>
  );
}
