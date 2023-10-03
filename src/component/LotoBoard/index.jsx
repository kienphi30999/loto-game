import { useEffect } from "react";
import "./style.css";

const LotoBoard = ({
  matrix,
  onClickNumber,
  listNumberOfPlayer,
  listRandomNumber,
}) => {
  const renderCell = (data) => {
    return data.map((x, ix) => {
      return x.map((y, iy) => {
        return (
          <div
            style={{ backgroundColor: y ? "white" : "aqua" }}
            key={`${ix} - ${iy}`}
            className="loto-board-container--cell"
            onClick={() => {
              if (listRandomNumber.length > 0) {
                if (listRandomNumber?.includes(y)) {
                  onClickNumber(y);
                }
              }
            }}
          >
            {listNumberOfPlayer?.includes(y) && (
              <div className="loto-board-container--dot" />
            )}
            {y}
          </div>
        );
      });
    });
  };
  return (
    <div className="loto-board-container">{matrix && renderCell(matrix)}</div>
  );
};

export default LotoBoard;
