import { Link } from "react-router";
import logoOriginal from "../imports/logo cor original.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export default function Logo({ size = "md", linkTo = "/" }: LogoProps) {
  const scales = { sm: "scale-75", md: "scale-100", lg: "scale-125" };
  const heightClasses = {
    sm: "h-14 md:h-16",
    md: "h-20 md:h-28",
    lg: "h-24 md:h-32",
  };

  const inner = (
    <div className={`flex items-center origin-left ${scales[size]}`}>
      <img
        src={logoOriginal}
        alt="Rick Automóveis"
        className={`w-auto ${heightClasses[size]} object-contain`}
      />
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center no-underline">
        {inner}
      </Link>
    );
  }
  return inner;
}
