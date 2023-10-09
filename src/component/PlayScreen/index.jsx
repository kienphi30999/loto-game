import { useContext, useEffect, useRef, useState } from "react";
import { generate2DArray } from "../../utils";
import LotoBoard from "../LotoBoard";
import "./style.css";
import "./snow.css";
import { wsContext } from "../../context";
import { Modal } from "antd";
import Congrat from "../Congrat";
import Button from "../Button";
import useSound from "use-sound";
import PlayButton from "../PlayButton";
import {
  Animal1,
  Animal2,
  Animal3,
  Animal4,
  Animal5,
  Animal6,
  HostIcon,
} from "../../icon";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

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

const colorBoard = [
  "#BDB5DF",
  "#508072",
  "#1A5446",
  "#004F7A",
  "#ADA9BB",
  "#00C5DB",
  "#F7AF57",
];

const avatarRandom = [
  <Animal1 />,
  <Animal2 />,
  <Animal3 />,
  <Animal4 />,
  <Animal5 />,
  <Animal6 />,
];

const PlayScreen = ({ role, roomName, name, onReturnToWaitingRoom }) => {
  const [matrix, setMatrix] = useState(null);
  const [color, setColor] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [isClickStart, setIsClickStart] = useState(false);
  const [isClickRandomAuto, setIsClickRandomAuto] = useState(false);
  const [isGameStart, setIsGameStart] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const [isRunRandom, setIsRunRandom] = useState(false);
  const [listRandomNumber, setListRandomNumber] = useState([]);
  const [defaultListRandom, setDefaultListRandom] = useState(
    Array.from({ length: 90 }, (_, i) => i + 1)
  );
  const [listNumberOfPlayer, setListNumberOfPlayer] = useState([]);
  const [listUser, setListUser] = useState([]);

  const randomFunc = useRef();

  const wsContextValue = useContext(wsContext);

  const [spinPlay, { stop: spinStop }] = useSound("/sound_spin.mp3", {
    loop: true,
  });
  const [afterSpinPlay] = useSound("/sound_after_spin.mp3");
  const [clockPlay, { stop: clockStop }] = useSound("/tick_tock.mp3");
  const [startGamePlay] = useSound("/game_start.mp3");

  useEffect(() => {
    onClickRandom();
    wsContextValue.emit("get-list-user", {
      room_id: roomName,
    });
    wsContextValue.on("list-user-name", (data) => {
      const objectHost = data?.find(
        (item) => Object.keys(item || {})?.[0] === "is_host"
      );
      const hostId = objectHost?.["is_host"]?.sid;
      const formatData = data?.slice(1)?.map((item) => {
        const newId = Object.keys(item || {})?.[0];
        const newName = Object.values(item || {})?.[0];
        const randomAvt =
          avatarRandom[Math.floor(Math.random() * avatarRandom.length)];
        return {
          id: newId,
          name: newName,
          isHost: hostId === newId,
          avatar: randomAvt,
        };
      });
      setListUser(formatData);
    });
    return () => {
      wsContextValue.off("list-user-name");
    };
  }, [roomName, wsContextValue]);
  useEffect(() => {
    wsContextValue.on("add-user", (data) => {
      const newId = Object.keys(data || {})?.[0];
      const newName = Object.values(data || {})?.[0];
      const checkId = listUser?.map((x) => x?.id);
      const checkName = listUser?.map((x) => x?.name);
      const randomAvt =
        avatarRandom[Math.floor(Math.random() * avatarRandom.length)];
      if (!checkId?.includes(newId) && !checkName?.includes(newName)) {
        setListUser((prev) => [
          ...prev,
          { id: newId, name: newName, avatar: randomAvt, isHost: false },
        ]);
      }
    });
    wsContextValue.on("remove-user", (data) => {
      const newId = Object.keys(data || {})?.[0];
      const checkId = listUser?.map((x) => x?.id);
      if (checkId?.includes(newId)) {
        setListUser((prev) => prev?.filter((x) => x?.id !== newId));
      }
    });
    return () => {
      wsContextValue.off("add-user");
      wsContextValue.off("remove-user");
    };
  }, [listUser, roomName, wsContextValue]);
  useEffect(() => {
    if (isClickStart) {
      let count = 10;
      clockPlay();
      const countdownTime = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clockStop();
          startGamePlay();
          setIsGameStart(true);
          return clearInterval(countdownTime);
        }
      }, 1000);
    }
  }, [clockPlay, clockStop, isClickStart, startGamePlay]);
  useEffect(() => {
    if (isClickRandomAuto) {
      let count = 100;
      spinPlay();
      const countdownTime = setInterval(() => {
        count -= 1;
        const randomNum2 =
          defaultListRandom[
            Math.floor(Math.random() * defaultListRandom.length)
          ];
        setRandomNumber(randomNum2);
        if (count === 0) {
          spinStop();
          setIsClickRandomAuto(false);
          afterSpinPlay();
          setTimeout(() => {
            setDefaultListRandom((prev) =>
              prev?.filter((item) => item !== randomNum2)
            );
            setListRandomNumber((prev) => [randomNum2, ...prev]);
            wsContextValue.emit("send-lucky-number-to-user", {
              lucky_number: randomNum2,
              room_id: roomName,
            });
          }, 0);
          // startGamePlay();
          // setIsGameStart(true);
          return clearInterval(countdownTime);
        }
      }, 10);
    }
  }, [
    afterSpinPlay,
    defaultListRandom,
    isClickRandomAuto,
    roomName,
    spinPlay,
    spinStop,
    wsContextValue,
  ]);
  useEffect(() => {
    if (isRunRandom) {
      spinPlay();
      randomFunc.current = setInterval(() => {
        const randomNum2 =
          defaultListRandom[
            Math.floor(Math.random() * defaultListRandom.length)
          ];
        setRandomNumber(randomNum2);
      }, 10);
    } else {
      spinStop();
      clearInterval(randomFunc.current);
      randomFunc.current = null;
    }
  }, [defaultListRandom, isRunRandom, spinPlay, spinStop]);
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
        setTimeout(() => {
          setRandomNumber(latestRandomNumber);
        }, 70);
        setDefaultListRandom((prev) =>
          prev?.filter((item) => item !== latestRandomNumber)
        );
        setListRandomNumber((prev) => [latestRandomNumber, ...prev]);
      });
    }
    wsContextValue.on("out-room", (data) => {
      onResetGame();
      Modal.destroyAll();
      onReturnToWaitingRoom();
    });
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
            onOut={() => {
              if (role === "host") {
                wsContextValue.emit("owner-out-room", { room_id: roomName });
              }
            }}
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
  }, [name, onReturnToWaitingRoom, role, roomName, wsContextValue]);

  const onClickRandom = () => {
    const data = generate2DArray();
    const colorRandom = Math.floor(Math.random() * colorBoard.length);
    setMatrix(data);
    setColor(colorBoard?.[colorRandom]);
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
    if (e.detail === 1 && !isRunRandom && !isClickRandomAuto) {
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
      afterSpinPlay();
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
  const onClickRandomANumberAuto = (e, room_id) => {
    if (!isRunRandom && !isClickRandomAuto) {
      setIsClickRandomAuto(true);
      setTimeout(() => {
        wsContextValue.emit("random-lucky-number-to-user", {
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
  console.log(listUser);
  return (
    <div className="play-screen">
      {Array.from({ length: 200 }, (_, i) => i + 1).map((item, idx) => {
        return <div key={idx} className="snow" />;
      })}
      <div className="play-screen-container">
        <div className="play-screen-header">
          <div className="play-screen-random-number">
            <div style={{ fontSize: 18 }}>Số người chơi</div>
            <div>{listUser?.length}</div>
          </div>
          <div className="play-screen-random-number">
            <div style={{ fontSize: 18 }}>Số may mắn</div>
            <div>{randomNumber < 10 ? `0${randomNumber}` : randomNumber}</div>
          </div>
          <div className="play-screen-random-number">
            <div style={{ fontSize: 18 }}>Mã phòng</div>
            <div>{roomName}</div>
          </div>
        </div>
        <div className="play-screen-body">
          <div className="play-screen-list-user">
            <strong
              style={{ fontSize: 18, color: "#ffffff", fontWeight: "bold" }}
            >
              Danh sách người chơi
            </strong>
            <div className="play-screen-list-user-container">
              {listUser?.map((item) => {
                return (
                  <div className="play-screen-user-item">
                    <div>{item?.avatar}</div>
                    <div style={{ color: "#ffffff" }}>
                      {item?.name} {wsContextValue?.id === item?.id && "(Bạn)"}
                    </div>
                    {item?.isHost && (
                      <div>
                        <HostIcon width={20} height={20} />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* {listRandomNumber.map((item, id) => {
                return (
                  <div
                    style={id === 0 ? { backgroundColor: color } : {}}
                    className="play-screen-list-number-item"
                  >
                    {item}
                  </div>
                );
              })} */}
            </div>
          </div>
          <LotoBoard
            matrix={matrix}
            color={color}
            listNumberOfPlayer={listNumberOfPlayer}
            listRandomNumber={listRandomNumber}
            onClickNumber={(val) =>
              setListNumberOfPlayer((prev) => [val, ...prev])
            }
          />
          {/* {listRandomNumber && listRandomNumber?.length > 0 ? ( */}
          <div className="play-screen-list-number">
            <strong
              style={{ fontSize: 18, color: "#ffffff", fontWeight: "bold" }}
            >
              Danh sách các số
            </strong>
            <div className="play-screen-list-number-container">
              {listRandomNumber.map((item, id) => {
                return (
                  <div
                    style={id === 0 ? { backgroundColor: color } : {}}
                    className="play-screen-list-number-item"
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
          {/* ) : (
            <div style={{ width: "3%" }} />
          )} */}
        </div>
        <div className="play-screen-action-container">
          {!isGameStart && (
            <PlayButton
              clickSound="/sound_choose.mp3"
              hoverSound=""
              // className="play-screen--random-btn"
              onClick={onClickRandom}
            >
              <div>Thần tài chọn số</div>
              {isClickStart && (
                <div>(00:{countdown < 10 ? `0${countdown}` : 10})</div>
              )}
            </PlayButton>
          )}
          {isGameStart && role === "host" && (
            <>
              {/* {!isClickRandomAuto && ( */}
              <PlayButton
                clickSound=""
                hoverSound=""
                // className="play-screen--random-btn"
                onClick={(e) => onClickRandomANumberAuto(e, roomName)}
                style={{
                  opacity: !isRunRandom && !isClickRandomAuto ? 1 : 0.5,
                  cursor:
                    !isRunRandom && !isClickRandomAuto
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Quay số tự động
              </PlayButton>
              {/* )} */}
              {!isRunRandom && (
                <PlayButton
                  clickSound=""
                  hoverSound=""
                  // className="play-screen--random-btn"
                  onClick={(e) => onClickRandomANumber(e, roomName)}
                  style={{
                    opacity: !isRunRandom && !isClickRandomAuto ? 1 : 0.5,
                    cursor:
                      !isRunRandom && !isClickRandomAuto
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Quay số bằng cơm
                </PlayButton>
              )}
              {isRunRandom && (
                <PlayButton
                  clickSound=""
                  hoverSound=""
                  // className="play-screen--random-btn"
                  onClick={(e) => onClickStopRandomANumber(e, roomName)}
                  style={{
                    opacity: isRunRandom ? 1 : 0.5,
                    cursor: isRunRandom ? "pointer" : "not-allowed",
                  }}
                >
                  Dừng
                </PlayButton>
              )}
            </>
          )}
          {!isClickStart && role === "host" && (
            <PlayButton
              clickSound=""
              hoverSound=""
              // className="play-screen--random-btn"
              onClick={() => onClickStart(roomName)}
            >
              Bắt đầu chơi
            </PlayButton>
            // <PlayButton
            //   text="Bắt đầu chơi"
            //   onClick={() => onClickStart(roomName)}
            // />
          )}
          {isWin(matrix, listNumberOfPlayer) && (
            <PlayButton
              clickSound=""
              hoverSound=""
              onClick={() => onClickBingo(matrix, listNumberOfPlayer, roomName)}
            >
              Bingo
            </PlayButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayScreen;
