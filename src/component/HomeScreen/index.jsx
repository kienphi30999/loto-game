import { useContext, useState } from "react";
import { Input, Space, message } from "antd";
import { wsContext } from "../../context";
import "./style.css";
import PlayScreen from "../PlayScreen";
import Button from "../Button";
import useSound from "use-sound";

const HomeScreen = () => {
  const [step, setStep] = useState("1");
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomNameAfterJoin, setRoomNameAfterJoin] = useState("");
  const [listRoom, setListRoom] = useState([]);
  const wsContextValue = useContext(wsContext);
  const [backgroundPlay] = useSound("/sound_background.wav", {
    volume: 0.5,
    loop: true,
  });

  const onEnter = () => {
    if (name) {
      setStep("2");
      wsContextValue.emit("client-set-name", { name: name });
    }
  };
  const onCreateRoom = () => {
    setStep("create");
  };
  const onJoinRoom = () => {
    setStep("join");
    wsContextValue.emit("get-list-room");
    wsContextValue.on("list-room", (data) => {
      setListRoom(data);
    });
  };
  const onEnterAfterJoin = (name) => {
    if (name) {
      wsContextValue.emit("client-join-room", { name: name });
      if (
        listRoom?.length > 0 &&
        !listRoom?.map((x) => x?.["room name"])?.includes(name)
      ) {
        return message.error({
          content: "Mã phòng không tồn tại trong hệ thống. Vui lòng nhập lại!!!",
          key: "can-not-join-due-to-wrong-name",
        });
      }
      wsContextValue.on("notification", (data) => {
        message.warning({
          content: "Trò chơi đã được bắt đầu. Vui lòng tham gia phòng khác!!!",
          key: "can-not-join-noti",
        });
        return setStep("join");
      });
      wsContextValue.on("client-join-room", (data) => {
        backgroundPlay();
        return setStep("final-player");
      });
    }
  };
  const onEnterRoom = () => {
    if (roomName) {
      wsContextValue.emit("client-create-room", { name: roomName });
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
                  onClick={() => {
                    setStep("1");
                    setName("");
                  }}
                >
                  <div>QUAY LẠI</div>
                </Button>
              </>
            )}
            {step === "join" && listRoom.length === 0 && (
              <>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#023581" }}
                >
                  KHÔNG CÓ PHÒNG !!!
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
                  <div>QUAY LẠI</div>
                </Button>
              </>
            )}
            {step === "join" && listRoom.length > 0 && (
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
                  onClick={() => onEnterAfterJoin(roomNameAfterJoin)}
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
            {step === "create" && (
              <>
                <div className="home-screen-input">
                  <Input
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Nhập tên phòng"
                    bordered={false}
                  />
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
          role={step?.includes("host") ? "host" : "player"}
          name={name}
          roomName={roomName}
          onReturnToWaitingRoom={() => {
            setStep("2");
            setListRoom([]);
            setRoomName("");
            setRoomNameAfterJoin("");
          }}
        />
      )}
    </>
  );
};

export default HomeScreen;
