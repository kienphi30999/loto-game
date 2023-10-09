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
  const [hoverPlay] = useSound(hoverSound, { volume: 0.5, format: ["mp3"] });
  const [clickPlay] = useSound(clickSound, { format: ["mp3"] });
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const handleHover = () => {
    if (!isButtonHovered) {
      hoverPlay();
      setIsButtonHovered(true);
    }
  };

  const handleMouseLeave = () => {
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
