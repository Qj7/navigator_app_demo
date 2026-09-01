type AppLogoProps = {
  size?: number;
  className?: string;
};

export function AppLogo({ size = 32, className = "" }: AppLogoProps) {
  return (
    <img
      src="/avatar.png"
      alt="Navigator Tour"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}
