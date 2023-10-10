import Bubble from "./Bubble";
import City from "./City";
import Firefly from "./Firefly";
import Moon from "./Moon";
import Snow from "./Snow";

const CustomBackground = ({ type, children }) => {
  if (type === 0) {
    return <Snow>{children}</Snow>;
  }
  if (type === 1) {
    return <Moon>{children}</Moon>;
  }
  if (type === 2) {
    return <City>{children}</City>;
  }
  if (type === 3) {
    return <Firefly>{children}</Firefly>;
  }
  return <Bubble>{children}</Bubble>;
};

export default CustomBackground;
