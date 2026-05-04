export const Logo = ({ size = 40, dark = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Vianord"
  >
    <rect width="40" height="40" fill={dark ? "#0F172A" : "#1E3A8A"} />
    {/* Bold V — two angled arms meeting at a sharp tip */}
    <path d="M5,8 L14,8 L20,27 L26,8 L35,8 L20,34 Z" fill="#FBBF24" />
    {/* North accent: thin bar at top */}
    <rect x="5" y="4" width="30" height="1.8" fill="#FBBF24" opacity="0.4" />
  </svg>
);

export default Logo;
