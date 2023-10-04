import { useContext, useEffect, useRef, useState } from "react";
import { generate2DArray } from "../../utils";
import LotoBoard from "../LotoBoard";
import "./style.css";
import { wsContext } from "../../context";
import { Modal } from "antd";
import Congrat from "../Congrat";

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
    (item) => countItemEachRow?.[item] === 2
  );

  return winRow;
};

const PlayScreen = ({ role, roomName, name }) => {
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
  useEffect(() => {
    if (role === "player") {
      wsContextValue.on("count-down", (data) => {
        setIsClickStart(true);
      });
      wsContextValue.on("random-lucky-number", (data) => {
        setIsRunRandom(true);
      });
      wsContextValue.on("lucky-range", (data) => {
        if (data?.length === 0) {
          onResetGame();
          return Modal.destroyAll();
        }
        const listRandomNumber = data?.[0];
        const latestRandomNumber =
          listRandomNumber?.[listRandomNumber?.length - 1];
        setIsRunRandom(false);
        setRandomNumber(latestRandomNumber);
        setDefaultListRandom((prev) =>
          prev?.filter((item) => item !== latestRandomNumber)
        );
        setListRandomNumber((prev) => [latestRandomNumber, ...prev]);
      });
    }
    wsContextValue.on("bingo", (data) => {
      const { username, lucky_range } = data;
      Modal.success({
        content: (
          <Congrat
            role={role}
            name={name}
            playerName={username}
            numberList={lucky_range}
            onReplay={() => {
              wsContextValue.emit("reset-lucky-number", { room_id: roomName });
              onResetGame();
              Modal.destroyAll();
            }}
            onOut={() => {}}
          />
        ),
        centered: true,
        okButtonProps: {
          style: { display: "none" },
        },
        bodyStyle: { padding: 0 },
        icon: null,
        width: 500,
      });
    });
    return () => {
      wsContextValue.off("count-down");
      wsContextValue.off("random-lucky-number");
      wsContextValue.off("lucky-range");
      wsContextValue.off("bingo");
    };
  }, [name, role, roomName, wsContextValue]);

  // useEffect(() => {
  //   Modal.success({
  //     content: (
  //       <Congrat playerName={"Player01"} numberList={[3, 23, 57, 68, 85]} />
  //     ),
  //     centered: true,
  //     okButtonProps: {
  //       style: { display: "none" },
  //     },
  //     bodyStyle: { padding: 0 },
  //     icon: null,
  //     width: 500,
  //   });
  //   return () => {
  //     Modal.destroyAll();
  //   };
  // }, []);
  const onClickRandom = () => {
    const data = generate2DArray();
    setMatrix(data);
  };
  const onResetGame = () => {
    setIsRunRandom(false);
    setRandomNumber(0);
    setDefaultListRandom(Array.from({ length: 90 }, (_, i) => i + 1));
    setListRandomNumber([]);
    setCountdown(10);
    setIsClickStart(false);
    setIsGameStart(false);
    setListNumberOfPlayer([]);
  };
  const onClickStart = (room_id) => {
    setIsClickStart(true);
    wsContextValue.emit("start-game", {
      countdown_time: 10,
      room_id: room_id,
    });
  };
  const onClickRandomANumber = (e, room_id) => {
    if (e.detail === 1 && !isRunRandom) {
      setIsRunRandom(true);
      setTimeout(() => {
        wsContextValue.emit("random-lucky-number-to-user", {
          room_id: room_id,
        });
      }, 0);
    }
  };
  const onClickStopRandomANumber = (e, room_id) => {
    if (e.detail === 1 && isRunRandom) {
      setIsRunRandom(false);
      setTimeout(() => {
        setDefaultListRandom((prev) =>
          prev?.filter((item) => item !== randomNumber)
        );
        setListRandomNumber((prev) => [randomNumber, ...prev]);
        wsContextValue.emit("send-lucky-number-to-user", {
          lucky_number: randomNumber,
          room_id: room_id,
        });
      }, 0);
    }
  };
  const onClickBingo = (boardData, selectedList, room_id) => {
    const winRow = isWin(boardData, selectedList);
    const idWinRow = +winRow?.[winRow?.length - 1] - 1;
    const listWinRow = boardData?.[idWinRow]?.filter((x) => x);
    wsContextValue.emit("bingo", {
      lucky_range: listWinRow,
      room_id: room_id,
    });
  };
  return (
    <>
      <div className="play-screen-container">
        <div className="play-screen-random-number">
          <div style={{ fontSize: 18 }}>Số may mắn</div>
          <div>{randomNumber < 10 ? `0${randomNumber}` : randomNumber}</div>
        </div>
        {listRandomNumber && listRandomNumber?.length > 0 && (
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
        )}
        <div className="play-screen-action-container">
          {!isGameStart && (
            <div className="play-screen--random-btn" onClick={onClickRandom}>
              <div>Thần tài chọn số</div>
              {isClickStart && (
                <div>(00:{countdown < 10 ? `0${countdown}` : 10})</div>
              )}
            </div>
          )}
          {isGameStart && role === "host" && (
            <>
              <div
                className="play-screen--random-btn"
                onClick={(e) => onClickRandomANumber(e, roomName)}
                style={{
                  opacity: !isRunRandom ? 1 : 0.5,
                  cursor: !isRunRandom ? "pointer" : "not-allowed",
                }}
              >
                Quay số
              </div>
              <div
                className="play-screen--random-btn"
                onClick={(e) => onClickStopRandomANumber(e, roomName)}
                style={{
                  opacity: isRunRandom ? 1 : 0.5,
                  cursor: isRunRandom ? "pointer" : "not-allowed",
                }}
              >
                Dừng
              </div>
            </>
          )}
          {!isClickStart && role === "host" && (
            <div
              className="play-screen--random-btn"
              onClick={() => onClickStart(roomName)}
            >
              Bắt đầu chơi
            </div>
          )}
          {isWin(matrix, listNumberOfPlayer) && (
            <div
              onClick={() => onClickBingo(matrix, listNumberOfPlayer, roomName)}
              className="play-screen--random-btn"
            >
              Bingo
            </div>
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
