import { memo, useContext, useEffect, useRef, useState } from "react";
import { generate2DArray } from "../../utils";
import { Popover, Space, message, notification } from "antd";
import LotoBoard from "../LotoBoard";
import "./style.css";
import "./snow.css";
import { wsContext } from "../../context";
import Congrat from "../Congrat";
import useSound from "use-sound";
import PlayButton from "../PlayButton";
import {
  AngryIcon,
  ClockIcon,
  HostIcon,
  MagicHandIcon,
  MagicIcon,
  OutIcon,
  PlayIcon,
  StopIcon,
  SurpriseIcon,
  TouchIcon,
  TrophyIcon,
} from "../../icon";
import CustomBackground from "../Background";

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
    (item) => countItemEachRow?.[item] === 5
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

const PlayScreen = ({
  role,
  roomName,
  name,
  onReturnToWaitingRoom,
  background,
  timeAuto,
}) => {
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
  const [bingoState, setBingoState] = useState({
    isBingo: false,
    playerName: null,
    numberList: [],
  });

  const randomFunc = useRef();

  const wsContextValue = useContext(wsContext);

  const [spinPlay, { stop: spinStop }] = useSound("/sound_spin.mp3", {
    loop: true,
    format: ["mp3"],
  });
  const [afterSpinPlay] = useSound("/sound_after_spin.mp3", {
    format: ["mp3"],
  });
  const [clockPlay, { stop: clockStop }] = useSound("/tick_tock.mp3", {
    format: ["mp3"],
  });
  const [startGamePlay] = useSound("/game_start.mp3", { format: ["mp3"] });
  const [notificationPlay] = useSound("/sound_notification.mp3", {
    format: ["mp3"],
    volume: 0.6,
  });

  useEffect(() => {
    onClickRandom();
    wsContextValue.emit("get-list-user", {
      room_id: roomName,
    });
    wsContextValue.on("list-user-name", (data) => {
      if (data?.length >= 2) {
        message.info({
          content: "Bạn vừa mới tham gia phòng",
          key: "user-join-room",
        });
      }
      const objectHost = data?.find(
        (item) => Object.keys(item || {})?.[0] === "is_host"
      );
      const hostId = objectHost?.["is_host"]?.sid;
      const formatData = data?.slice(1)?.map((item) => {
        const newId = Object.keys(item || {})?.[0];
        const newName = Object.values(item || {})?.[0];
        const randomAvt = Math.floor(Math.random() * 6) + 1;
        return {
          id: newId,
          name: newName,
          isHost: hostId === newId,
          avtIndex: randomAvt,
        };
      });
      setListUser(formatData);
    });
    return () => {
      wsContextValue.off("list-user-name");
    };
  }, [role, roomName, wsContextValue]);
  useEffect(() => {
    wsContextValue.on("add-user", (data) => {
      const newId = Object.keys(data || {})?.[0];
      const newName = Object.values(data || {})?.[0];
      const checkId = listUser?.map((x) => x?.id);
      const checkName = listUser?.map((x) => x?.name);
      const randomAvt = Math.floor(Math.random() * 6) + 1;
      if (!checkId?.includes(newId) && !checkName?.includes(newName)) {
        newId === wsContextValue.id
          ? message.info("Bạn vừa mới tham gia phòng")
          : message.info(
              <span>
                Người chơi <strong>{newName}</strong> vừa mới tham gia phòng
              </span>
            );
        setListUser((prev) => [
          ...prev,
          { id: newId, name: newName, avtIndex: randomAvt, isHost: false },
        ]);
      }
    });
    wsContextValue.on("remove-user", (data) => {
      const newId = Object.keys(data || {})?.[0];
      const checkId = listUser?.map((x) => x?.id);
      const newName = listUser?.find((x) => x?.id === newId)?.name;
      if (checkId?.includes(newId)) {
        message.warning(
          <span>
            Người chơi <strong>{newName}</strong> đã rời khỏi phòng
          </span>
        );
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
      let count = 100 * (timeAuto - 1);
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
          wsContextValue.emit("send-lucky-number-to-user", {
            lucky_number: randomNum2,
            room_id: roomName,
          });
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
    timeAuto,
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
    }
    wsContextValue.on("lucky-range", (data) => {
      if (data?.length === 0) {
        return onResetGame();
      }
      const listRandomNumber = data?.[0];
      const latestRandomNumber =
        listRandomNumber?.[listRandomNumber?.length - 1];
      setIsRunRandom(false);
      setTimeout(() => {
        setRandomNumber(latestRandomNumber);
        setDefaultListRandom((prev) =>
          prev?.filter((item) => item !== latestRandomNumber)
        );
        setListRandomNumber((prev) => [latestRandomNumber, ...prev]);
      }, 20);
    });
    wsContextValue.on("out-room", (data) => {
      message.warning(`${role === "host" ? "Bạn" : "Chủ phòng"} đã thoát`);
      onResetGame();
      onReturnToWaitingRoom();
    });
    wsContextValue.on("bingo", (data) => {
      const { username, lucky_range } = data;
      setBingoState({
        isBingo: true,
        playerName: username,
        numberList: lucky_range,
      });
    });
    return () => {
      wsContextValue.off("count-down");
      wsContextValue.off("random-lucky-number");
      wsContextValue.off("lucky-range");
      wsContextValue.off("bingo");
      wsContextValue.off("out-room");
    };
  }, [name, onReturnToWaitingRoom, role, roomName, wsContextValue]);
  useEffect(() => {
    wsContextValue.on("client-interact", (data) => {
      const getUser = listUser?.find(
        (item) => item?.id === data?.from_sid
      )?.name;
      if (data?.content === "shit" && role === "host") {
        notificationPlay();
        notification.warning({
          message: <strong>Bạn vừa bị {getUser} ném đá</strong>,
          description: "Vì một lí do nào đó, người chơi này muốn ném đá bạn",
          key: "shit",
        });
      }
      if (
        data?.content === "you-touch" &&
        wsContextValue?.id !== data?.from_sid
      ) {
        notificationPlay();
        notification.warning({
          message: <strong>Bạn vừa bị {getUser} ghẹo</strong>,
          description: "Chắc người ta thích bạn nên ghẹo vậy thui đó",
          key: "you-touch",
        });
      }
    });
    wsContextValue.on("interact-all", (data) => {
      const getUser = listUser?.find(
        (item) => item?.id === data?.from_sid
      )?.name;
      const isHost = listUser?.find(
        (item) => item?.id === data?.from_sid
      )?.isHost;
      if (data?.from_sid !== wsContextValue?.id) {
        if (isHost) {
          notificationPlay();
          notification.warning({
            message: <strong>Chủ phòng chỉ còn 1 số nữa thôi</strong>,
            description:
              "Người chơi này sẽ bingo ngay nếu trúng thêm 1 số nữa. Bạn hãy cẩn thận",
            key: "only-1-to-bingo",
          });
        } else {
          notificationPlay();
          notification.warning({
            message: <strong>{getUser} chỉ còn 1 số nữa thôi</strong>,
            description:
              "Người chơi này sẽ bingo ngay nếu trúng thêm 1 số nữa. Bạn hãy cẩn thận",
            key: "only-1-to-bingo",
          });
        }
      }
    });

    return () => {
      wsContextValue.off("client-interact");
    };
  }, [listUser, notificationPlay, role, wsContextValue]);

  const onClickRandom = () => {
    const data = generate2DArray();
    const colorRandom = Math.floor(Math.random() * colorBoard.length);
    setMatrix(data);
    setColor(colorBoard?.[colorRandom]);
  };
  const onResetGame = () => {
    setBingoState({ isBingo: false, playerName: null, numberList: [] });
    setIsRunRandom(false);
    setRandomNumber(0);
    setDefaultListRandom(Array.from({ length: 90 }, (_, i) => i + 1));
    setListRandomNumber([]);
    setCountdown(10);
    setIsClickStart(false);
    setIsGameStart(false);
    setListNumberOfPlayer([]);
    setIsClickRandomAuto(false);
  };
  const onClickStart = (e, room_id) => {
    if (e?.detail === 1 && room_id) {
      setIsClickStart(true);
      wsContextValue.emit("start-game", {
        countdown_time: 10,
        room_id: room_id,
      });
    }
  };
  const onClickRandomANumber = (e, room_id) => {
    if (e.detail === 1 && !isRunRandom && !isClickRandomAuto) {
      setIsRunRandom(true);
      wsContextValue.emit("random-lucky-number-to-user", {
        room_id: room_id,
      });
    }
  };
  const onClickStopRandomANumber = (e, room_id) => {
    if (e.detail === 1 && isRunRandom) {
      afterSpinPlay();
      setIsRunRandom(false);
      wsContextValue.emit("send-lucky-number-to-user", {
        lucky_number: randomNumber,
        room_id: room_id,
      });
    }
  };
  const onClickRandomANumberAuto = (e, room_id) => {
    if (!isRunRandom && !isClickRandomAuto) {
      setIsClickRandomAuto(true);
      wsContextValue.emit("random-lucky-number-to-user", {
        room_id: room_id,
      });
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
  const onClickOutRoom = (room_id) => {
    if (room_id) {
      if (role === "host") {
        return wsContextValue.emit("owner-out-room", { room_id: roomName });
      } else {
        message.warning("Bạn đã rời khỏi phòng");
        onReturnToWaitingRoom();
        return wsContextValue.emit("client-out-room", {
          room_id: room_id,
        });
      }
    }
  };
  return (
    <>
      {bingoState?.isBingo ? (
        <Congrat
          playerName={bingoState?.playerName}
          numberList={bingoState?.numberList}
          role={role}
          name={name}
          onReplay={() => {
            if (role === "host") {
              wsContextValue.emit("reset-lucky-number", { room_id: roomName });
            } else {
              wsContextValue.emit("client-interact", {
                content: "want-to-replay",
                receive_sid: listUser?.find((x) => x?.isHost)?.id,
              });
            }
          }}
          onOut={() => {
            if (role === "host") {
              wsContextValue.emit("owner-out-room", { room_id: roomName });
            } else {
              message.warning("Bạn đã rời khỏi phòng");
              onReturnToWaitingRoom();
              wsContextValue.emit("client-out-room", {
                room_id: roomName,
              });
            }
          }}
        />
      ) : (
        <CustomBackground type={background}>
          <div
            onClick={() => onClickOutRoom(roomName)}
            className="play-screen-out-room"
          >
            <OutIcon />
          </div>
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
                    <div key={item?.id} className="play-screen-user-item">
                      <div>
                        <img src={`/animal${item?.avtIndex}.svg`} alt="" />
                      </div>
                      <div style={{ color: "#ffffff" }}>
                        {item?.name}{" "}
                        {wsContextValue?.id === item?.id && "(Bạn)"}
                      </div>
                      {item?.isHost && (
                        <div>
                          <HostIcon width={20} height={20} />
                        </div>
                      )}
                      {wsContextValue?.id !== item?.id && (
                        <Popover
                          title={null}
                          content="Ghẹo"
                          align={{ offset: [0, 0] }}
                        >
                          <div
                            onClick={() => {
                              message.success({
                                content: `Bạn vừa ghẹo ${item?.name}`,
                                key: `you-touch-${item?.id}`,
                              });
                              wsContextValue.emit("client-interact", {
                                content: "you-touch",
                                receive_sid: item?.id,
                              });
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <TouchIcon />
                          </div>
                        </Popover>
                      )}
                    </div>
                  );
                })}
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
                      key={item}
                      style={id === 0 ? { backgroundColor: color } : {}}
                      className="play-screen-list-number-item"
                    >
                      {+item < 10 ? `0${item}` : item}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="play-screen-action-container">
            {!isGameStart && (
              <>
                <PlayButton
                  clickSound="/sound_choose.mp3"
                  hoverSound=""
                  onClick={onClickRandom}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <img
                      style={{ width: 30, height: 30, objectFit: "cover" }}
                      src="/lucky-cat.png"
                      alt=""
                    />
                    <div>Thần tài chọn số</div>
                  </div>
                </PlayButton>
                <PlayButton
                  clickSound=""
                  hoverSound=""
                  style={{
                    cursor:
                      !isClickStart && role === "host"
                        ? "pointer"
                        : "not-allowed",
                    opacity: !isClickStart && role === "host" ? 1 : 0.5,
                  }}
                  onClick={(e) =>
                    !isClickStart &&
                    role === "host" &&
                    onClickStart(e, roomName)
                  }
                >
                  {isClickStart ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        justifyContent: "center",
                      }}
                    >
                      <ClockIcon />
                      <div>00:{countdown < 10 ? `0${countdown}` : 10}</div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <PlayIcon />
                      <div>Bắt đầu chơi</div>
                    </div>
                  )}
                </PlayButton>
              </>
            )}
            {isGameStart && role === "host" && (
              <>
                <PlayButton
                  clickSound=""
                  hoverSound=""
                  onClick={(e) => onClickRandomANumberAuto(e, roomName)}
                  style={{
                    opacity: !isRunRandom && !isClickRandomAuto ? 1 : 0.5,
                    cursor:
                      !isRunRandom && !isClickRandomAuto
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <MagicIcon />
                    <div>Quay số tự động</div>
                  </div>
                </PlayButton>
                {/* )} */}
                {!isRunRandom && (
                  <PlayButton
                    clickSound=""
                    hoverSound=""
                    onClick={(e) => onClickRandomANumber(e, roomName)}
                    style={{
                      opacity: !isRunRandom && !isClickRandomAuto ? 1 : 0.5,
                      cursor:
                        !isRunRandom && !isClickRandomAuto
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <MagicHandIcon />
                      <div>Quay số bằng cơm</div>
                    </div>
                  </PlayButton>
                )}
                {isRunRandom && (
                  <PlayButton
                    clickSound=""
                    hoverSound=""
                    onClick={(e) => onClickStopRandomANumber(e, roomName)}
                    style={{
                      opacity: isRunRandom ? 1 : 0.5,
                      cursor: isRunRandom ? "pointer" : "not-allowed",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <StopIcon />
                      <div>Dừng</div>
                    </div>
                  </PlayButton>
                )}
              </>
            )}
            {isGameStart && (
              <>
                {role === "player" && (
                  <PlayButton
                    clickSound=""
                    hoverSound=""
                    onClick={(e) => {
                      if (e.detail === 1) {
                        message.success({
                          content: "Bạn vừa ném đá chủ phòng",
                          key: "you-shit",
                        });
                        wsContextValue.emit("client-interact", {
                          content: "shit",
                          receive_sid: listUser?.find((x) => x?.isHost)?.id,
                        });
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <AngryIcon />
                      <div>Ném đá chủ phòng</div>
                    </div>
                  </PlayButton>
                )}
                <PlayButton
                  clickSound=""
                  hoverSound=""
                  onClick={(e) => {
                    if (e.detail === 1) {
                      message.success({
                        content:
                          "Bạn vừa thông báo đến mọi người rằng mình sắp bingo",
                        key: "you-about-to-bingo",
                      });
                      wsContextValue.emit("interact-all", {
                        content: "only-1-to-bingo",
                        room_id: roomName,
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <SurpriseIcon />
                    <div>Tui còn 1 số nữa</div>
                  </div>
                </PlayButton>
              </>
            )}
            {isWin(matrix, listNumberOfPlayer) && (
              <PlayButton
                clickSound=""
                hoverSound=""
                onClick={() =>
                  onClickBingo(matrix, listNumberOfPlayer, roomName)
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <TrophyIcon />
                  <div>Bingo</div>
                </div>
              </PlayButton>
            )}
          </div>
        </CustomBackground>
      )}
    </>
  );
};

export default memo(PlayScreen);
