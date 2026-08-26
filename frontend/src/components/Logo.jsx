export const Logo = ({ size = 40 }) => (
  <img
    src="/logo-vnt.jpeg"
    alt="ViaNordTrans"
    height={size}
    style={{ height: size, width: "auto", objectFit: "contain", display: "block" }}
  />
);

export default Logo;
