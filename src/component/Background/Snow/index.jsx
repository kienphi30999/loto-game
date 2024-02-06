import "./style.css";
import { BsFlower2 } from "react-icons/bs";

const Snow = ({ children }) => {
  return (
    <div className="play-screen--snow">
      {Array.from({ length: 200 }, (_, i) => i + 1).map((item, idx) => {
        return (
          <div key={idx} className="snow">
            <BsFlower2 color='yellow' size={24} />
          </div>
        );
      })}
      {children}
    </div>
  );
};

export default Snow;
