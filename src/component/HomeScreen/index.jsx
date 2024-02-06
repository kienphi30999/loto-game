import { memo, useContext, useState } from "react";
import { Input, message } from "antd";
import { wsContext } from "../../context";
import "./style.css";
import PlayScreen from "../PlayScreen";
import Button from "../Button";
import useSound from "use-sound";
import { LeftIcon, RightIcon } from "../../icon";

const settingList = [
  "Tết",
  "Mây đêm",
  "Thành phố",
  "Đom đóm",
  "Bọt biển",
];

const minTime = 2;
const maxTime = 6;

const HomeScreen = () => {
  const [step, setStep] = useState("1");
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomNameAfterJoin, setRoomNameAfterJoin] = useState("");
  const [listRoom, setListRoom] = useState([]);
  const [background, setBackground] = useState(0);
  const [timeAuto, setTimeAuto] = useState(minTime);
  const [isPrivate, setIsPrivate] = useState(false);
  const wsContextValue = useContext(wsContext);
  const [backgroundPlay, { stop: backgroundStop }] = useSound(
    "/sound_background2.mp3",
    {
      volume: 0.5,
      loop: true,
      format: ["mp3"],
    }
  );

  const onEnter = (e) => {
    if (name && e?.detail === 1) {
      if (name?.length > 20) {
        return message.warning("Tên player không được vượt quá 20 kí tự");
      }
      setStep("2");
      wsContextValue.emit("client-set-name", { name: name });
    }
  };
  const onCreateRoom = (e) => {
    if (e?.detail === 1) {
      setStep("create");
    }
  };
  const onJoinRoom = (e) => {
    if (e?.detail === 1) {
      setStep("join");
      wsContextValue.emit("get-list-room");
      wsContextValue.on("list-room", (data) => {
        setListRoom(data);
      });
    }
  };
  const onSetting = (e) => {
    if (e?.detail === 1) {
      setStep("setting");
    }
  };
  const onEnterAfterJoin = (e, name) => {
    if (name && e?.detail === 1) {
      wsContextValue.emit("client-join-room", { name: name });
      wsContextValue.on("notification", (data) => {
        if (data === "Phòng Không Tồn Tại !!!!") {
          message.warning({
            content: "Phòng không tồn tại. Vui lòng tham gia phòng khác!!!",
            key: "can-not-join-noti",
          });
        } else {
          message.warning({
            content:
              "Trò chơi đã được bắt đầu. Vui lòng tham gia phòng khác!!!",
            key: "can-not-join-noti",
          });
        }
        return setStep("join");
      });
      wsContextValue.on("client-join-room", (data) => {
        backgroundPlay();
        setRoomName(name);
        return setStep("final-player");
      });
    }
  };
  const onEnterRoom = (e) => {
    if (roomName && e?.detail === 1) {
      if (roomName?.length > 8) {
        return message.warning("Tên phòng không được vượt quá 8 kí tự");
      }
      wsContextValue.emit("client-create-room", {
        name: roomName,
        is_private: isPrivate,
      });
      wsContextValue.on("notification-error", (data) => {
        message.warning({
          content: "Tên phòng đã được tạo. Vui lòng tạo tên khác!!",
          key: "can-not-join-noti",
        });
        return setStep("create");
      });
      wsContextValue.on("client-join-room", (data) => {
        backgroundPlay();
        return setStep("final-host");
      });
    }
  };
  return (
    <>
      {!step?.includes("final") ? (
        <div id="home-container" className="home-screen-container">
          <div className="home-screen-action">
            {step === "1" && (
              <>
                <div className="home-screen-input">
                  <Input
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên player"
                    bordered={false}
                  />
                </div>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={onEnter}
                >
                  <div>NEXT</div>
                </Button>
              </>
            )}
            {step === "2" && (
              <>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={onCreateRoom}
                >
                  <div>TẠO PHÒNG</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={onJoinRoom}
                >
                  <div>THAM GIA</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={onSetting}
                >
                  <div>CÀI ĐẶT</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={() => {
                    setStep("1");
                    setName("");
                  }}
                >
                  <div>QUAY LẠI</div>
                </Button>
              </>
            )}
            {step === "setting" && (
              <>
                <div className="home-screen-setting">
                  <div>Hình nền khi chơi:</div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <LeftIcon
                      style={{
                        cursor: background !== 0 ? "pointer" : "not-allowed",
                        opacity: background !== 0 ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (background !== 0) {
                          setBackground((prev) => {
                            if (prev === 0) return 0;
                            return prev - 1;
                          });
                        }
                      }}
                      color="#BF0805"
                    />
                    <div>{settingList?.[background]}</div>
                    <RightIcon
                      style={{
                        cursor:
                          background !== settingList?.length - 1
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          background !== settingList?.length - 1 ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (background !== settingList?.length - 1) {
                          setBackground((prev) => {
                            if (prev === settingList?.length - 1) {
                              return settingList?.length - 1;
                            }
                            return prev + 1;
                          });
                        }
                      }}
                      color="#BF0805"
                    />
                  </div>
                </div>
                <div className="home-screen-setting">
                  <div>Thời gian quay tự động:</div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <LeftIcon
                      style={{
                        cursor: timeAuto !== minTime ? "pointer" : "not-allowed",
                        opacity: timeAuto !== minTime ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (timeAuto !== minTime) {
                          setTimeAuto((prev) => {
                            if (prev === minTime) return minTime;
                            return prev - 1;
                          });
                        }
                      }}
                      color="#BF0805"
                    />
                    <div>{timeAuto} giây</div>
                    <RightIcon
                      style={{
                        cursor: timeAuto !== maxTime ? "pointer" : "not-allowed",
                        opacity: timeAuto !== maxTime ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (timeAuto !== maxTime) {
                          setTimeAuto((prev) => {
                            if (prev === maxTime) {
                              return maxTime;
                            }
                            return prev + 1;
                          });
                        }
                      }}
                      color="#BF0805"
                    />
                  </div>
                </div>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={() => {
                    setStep("2");
                    setRoomName("");
                    setRoomNameAfterJoin("");
                  }}
                >
                  <div>LƯU</div>
                </Button>
              </>
            )}
            {step === "join" && (
              <>
                <div
                  style={{
                    fontSize: 18,
                    color: "#BF0805",
                    fontWeight: "bold",
                  }}
                >
                  Nhập mã phòng để tham gia
                </div>
                <div className="home-screen-input">
                  <Input
                    onChange={(e) => setRoomNameAfterJoin(e.target.value)}
                    placeholder="Mã phòng"
                    bordered={false}
                  />
                </div>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={(e) => onEnterAfterJoin(e, roomNameAfterJoin)}
                >
                  <div>ENTER</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={() => {
                    setStep("2");
                    setRoomName("");
                    setRoomNameAfterJoin("");
                  }}
                >
                  <div>QUAY LẠI</div>
                </Button>
                {listRoom?.length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#BF0805",
                        fontWeight: "bold",
                      }}
                    >
                      hoặc tham gia các phòng dưới
                    </div>
                    <div className="home-screen-list-room">
                      {listRoom?.map((item) => {
                        return (
                          <Button
                            key={item?.["room name"]}
                            className="home-screen-list-room--item"
                            onClick={(e) =>
                              onEnterAfterJoin(e, item?.["room name"])
                            }
                          >
                            <div>
                              <div>{item?.["room name"]}</div>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>
                                Có {item?.total} người tham gia
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
            {/* {step === "join" && listRoom.length > 0 && (
              <>
                <div className="home-screen-input">
                  <Input
                    onChange={(e) => setRoomNameAfterJoin(e.target.value)}
                    placeholder="Nhập mã phòng"
                    bordered={false}
                  />
                </div>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={(e) => onEnterAfterJoin(e, roomNameAfterJoin)}
                >
                  <div>ENTER</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={() => {
                    setStep("2");
                    setRoomName("");
                    setRoomNameAfterJoin("");
                  }}
                >
                  <div>QUAY LẠI</div>
                </Button>
              </>
            )} */}
            {step === "create" && (
              <>
                <div className="home-screen-input">
                  <Input
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Nhập tên phòng"
                    bordered={false}
                  />
                </div>
                <div
                  style={{ justifyContent: "center", gap: 15 }}
                  className="home-screen-setting"
                >
                  <div>Riêng tư:</div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <LeftIcon
                      style={{
                        cursor: isPrivate ? "pointer" : "not-allowed",
                        opacity: isPrivate ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (isPrivate) {
                          setIsPrivate(false);
                        }
                      }}
                      color="#BF0805"
                    />
                    <div>{isPrivate ? "Có" : "Không"}</div>
                    <RightIcon
                      style={{
                        cursor: !isPrivate ? "pointer" : "not-allowed",
                        opacity: !isPrivate ? 1 : 0.5,
                      }}
                      onClick={() => {
                        if (!isPrivate) {
                          setIsPrivate(true);
                        }
                      }}
                      color="#BF0805"
                    />
                  </div>
                </div>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={onEnterRoom}
                >
                  <div>ENTER</div>
                </Button>
                <Button
                  clickSound="/button_click.mp3"
                  className="home-screen-btn"
                  onClick={() => {
                    setStep("2");
                    setRoomName("");
                    setRoomNameAfterJoin("");
                  }}
                >
                  <div>QUAY LẠI</div>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <PlayScreen
          background={background}
          timeAuto={timeAuto}
          role={step?.includes("host") ? "host" : "player"}
          name={name}
          roomName={roomName}
          onReturnToWaitingRoom={() => {
            backgroundStop();
            setStep("2");
            setListRoom([]);
            setRoomName("");
            setRoomNameAfterJoin("");
            setIsPrivate(false);
          }}
        />
      )}
    </>
  );
};

export default memo(HomeScreen);
