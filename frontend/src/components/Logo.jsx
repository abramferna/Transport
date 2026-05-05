export const Logo = ({ size = 40, dark = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="ViaNordTrans"
  >
    <rect width="40" height="40" fill={dark ? "#0F172A" : "#1E3A8A"} />
    <text
      x="20"
      y="27"
      textAnchor="middle"
      fontFamily="Arial,sans-serif"
      fontWeight="900"
      fontSize="13"
      fill="#FBBF24"
      letterSpacing="-0.5"
    >VNT</text>
    <rect x="5" y="4" width="30" height="1.8" fill="#FBBF24" opacity="0.4" />
  </svg>
);

export default Logo;
