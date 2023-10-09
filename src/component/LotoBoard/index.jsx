import "./style.css";
import Button from "../Button";
import useSound from "use-sound";

const LotoBoard = ({
  matrix,
  color,
  onClickNumber,
  listNumberOfPlayer,
  listRandomNumber,
}) => {
  const [checkPlay] = useSound("/check.mp3", { format: ["mp3"] });
  const [checkErrorPlay] = useSound("/check_error.mp3", { format: ["mp3"] });
  const renderCell = (data) => {
    return data.map((x, ix) => {
      return x.map((y, iy) => {
        return (
          <Button
            style={{ backgroundColor: y ? "white" : color }}
            key={`${ix} - ${iy}`}
            className="loto-board-container--cell"
            clickSound=""
            hoverSound=""
            onClick={() => {
              if (listRandomNumber.length > 0) {
                if (listRandomNumber?.includes(y)) {
                  checkPlay();
                  onClickNumber(y);
                } else {
                  checkErrorPlay();
                }
              }
            }}
          >
            {listNumberOfPlayer?.includes(y) && (
              <div className="loto-board-container--dot" />
            )}
            {y}
          </Button>
        );
      });
    });
  };
  return (
    <div className="loto-board-container">{matrix && renderCell(matrix)}</div>
  );
};

export default LotoBoard;
