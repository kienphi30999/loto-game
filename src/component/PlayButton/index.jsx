import useSound from "use-sound";
import "./style.css";
import { useState } from "react";

const PlayButton = ({
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
      className="btn-3d blue"
    >
      {children}
    </div>
  );
};

export default PlayButton;
