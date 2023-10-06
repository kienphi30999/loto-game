import useSound from "use-sound";
// import hoverSound from "/button_hover.wav";
import { useState } from "react";

const Button = ({
  children,
  onClick,
  clickSound,
  hoverSound = "/button_hover.mp3",
  ...props
}) => {
  const [hoverPlay] = useSound(hoverSound, { volume: 0.5 });
  const [clickPlay] = useSound(clickSound);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const handleHover = () => {
    if (!isButtonHovered) {
      hoverPlay();
      setIsButtonHovered(true);
    }
  };

  const handleMouseLeave = () => {
    // stop();
    setIsButtonHovered(false);
  };
  return (
    <div
      onClick={(e) => {
        clickPlay();
        onClick(e);
      }}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default Button;
