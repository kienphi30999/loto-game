import { useContext, useEffect, useRef, useState } from "react";
import { generate2DArray } from "../../utils";
import LotoBoard from "../LotoBoard";
import "./style.css";
import { wsContext } from "../../context";

const isWin = (data, listSelect) => {
  const listRow = [];
  data?.forEach((row, idRow) => {
    listSelect?.forEach((item) => {
      if (row?.includes(item)) {
        listRow.push(`row ${idRow + 1}`);
      }
    });
  });
  const countItemEachRow = {};

  listRow?.forEach((ele) => {
    if (countItemEachRow[ele]) {
      countItemEachRow[ele] += 1;
    } else {
      countItemEachRow[ele] = 1;
    }
  });

  const winRow = Object.keys(countItemEachRow)?.find(
    (item) => countItemEachRow?.[item] === 1
  );

  return winRow;
};

const PlayScreen = () => {
  const [matrix, setMatrix] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [isClickStart, setIsClickStart] = useState(false);
  const [isGameStart, setIsGameStart] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const [isRunRandom, setIsRunRandom] = useState(false);
  const [listRandomNumber, setListRandomNumber] = useState([]);
  const [defaultListRandom, setDefaultListRandom] = useState(
    Array.from({ length: 90 }, (_, i) => i + 1)
  );
  const [listNumberOfPlayer, setListNumberOfPlayer] = useState([]);

  const randomFunc = useRef();

  const wsContextValue = useContext(wsContext);
  useEffect(() => {
    onClickRandom();
    // wsContextValue.emit("get-list-room");
    // wsContextValue.on("get-list-room", (data) => {
    //   console.log(data);
    // });
    // return () => {
    //   wsContextValue.off("get-list-room");
    // };
  }, [wsContextValue]);
  useEffect(() => {
    if (isClickStart) {
      let count = 10;
      const countdownTime = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          setIsGameStart(true);
          return clearInterval(countdownTime);
        }
      }, 1000);
    }
  }, [isClickStart]);
  useEffect(() => {
    if (isRunRandom) {
      randomFunc.current = setInterval(() => {
        const randomNum2 =
          defaultListRandom[
            Math.floor(Math.random() * defaultListRandom.length)
          ];
        setRandomNumber(randomNum2);
      }, 60);
    } else {
      clearInterval(randomFunc.current);
      randomFunc.current = null;
    }
  }, [defaultListRandom, isRunRandom]);
  const onClickRandom = () => {
    const data = generate2DArray();
    setMatrix(data);
  };
  const onClickStart = () => {
    setIsClickStart(true);
  };
  const onClickRandomANumber = (e) => {
    if (e.detail === 1 && !isRunRandom) {
      setIsRunRandom(true);
    }
  };
  const onClickStopRandomANumber = (e) => {
    if (e.detail === 1 && isRunRandom) {
      setIsRunRandom(false);
      setDefaultListRandom((prev) =>
        prev?.filter((item) => item !== randomNumber)
      );
      setListRandomNumber((prev) => [randomNumber, ...prev]);
    }
  };
  return (
    <>
      <div className="play-screen-container">
        <div className="play-screen-random-number">
          <div style={{ fontSize: 18 }}>Số may mắn</div>
          <div>{randomNumber < 10 ? `0${randomNumber}` : randomNumber}</div>
        </div>
        <div className="play-screen-list-number">
          <strong style={{ fontSize: 18 }}>Danh sách các số</strong>
          <div className="play-screen-list-number-container">
            {listRandomNumber.map((item, id) => {
              return (
                <div
                  style={id === 0 ? { backgroundColor: "yellow" } : {}}
                  className="play-screen-list-number-item"
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
        <div className="play-screen-action-container">
          {/* {!isGameStart && (
            <div className="play-screen--random-btn" onClick={onClickRandom}>
              <div>Thần tài chọn số</div>
              {isClickStart && (
                <div>(00:{countdown < 10 ? `0${countdown}` : 10})</div>
              )}
            </div>
          )} */}
          {/* {isGameStart && (
            <> */}
          <div
            className="play-screen--random-btn"
            onClick={onClickRandomANumber}
            style={{
              opacity: !isRunRandom ? 1 : 0.5,
              cursor: !isRunRandom ? "pointer" : "not-allowed",
            }}
          >
            Quay số
          </div>
          <div
            className="play-screen--random-btn"
            onClick={onClickStopRandomANumber}
            style={{
              opacity: isRunRandom ? 1 : 0.5,
              cursor: isRunRandom ? "pointer" : "not-allowed",
            }}
          >
            Dừng
          </div>
          {/* </>
          )} */}
          {/* {!isClickStart && (
            <div className="play-screen--random-btn" onClick={onClickStart}>
              Bắt đầu chơi
            </div>
          )} */}
          {isWin(matrix, listNumberOfPlayer) && (
            <div className="play-screen--random-btn">Kinh</div>
          )}
        </div>
        <LotoBoard
          matrix={matrix}
          listNumberOfPlayer={listNumberOfPlayer}
          listRandomNumber={listRandomNumber}
          onClickNumber={(val) =>
            setListNumberOfPlayer((prev) => [val, ...prev])
          }
        />
      </div>
    </>
  );
};

export default PlayScreen;
