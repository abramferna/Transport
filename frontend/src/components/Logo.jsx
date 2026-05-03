export const Logo = ({ size = 40, dark = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Vianord"
  >
    <rect width="40" height="40" fill={dark ? "#0F172A" : "#FFFFFF"} />
    {/* Stylized V/N: two angled stripes evoking AP-7 north */}
    <path d="M 8 30 L 16 10 L 20 18 L 28 10 L 32 30 L 26 30 L 24 22 L 20 28 L 16 22 L 14 30 Z" fill="#FBBF24" />
    {/* North arrow tip */}
    <circle cx="33" cy="8" r="2" fill="#FBBF24" />
  </svg>
);

export default Logo;
