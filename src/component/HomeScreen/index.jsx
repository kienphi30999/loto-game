import { useContext, useEffect, useState } from "react";
import { App, Empty, Input, Modal, Space, message } from "antd";
import { wsContext } from "../../context";
import "./style.css";
import PlayScreen from "../PlayScreen";
// import {useHis} from 'react-router-dom'

const HomeScreen = () => {
  const [step, setStep] = useState("1");
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [listRoom, setListRoom] = useState([]);
  const wsContextValue = useContext(wsContext);
  // const clickPlay = () => {
  //   const soundBackground = new Audio("/sound/sound_background.wav");
  //   soundBackground.loop = true;
  //   soundBackground.play();
  // };
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
  const onClickRoom = (name) => {
    if (name) {
      setRoomName(name);
      wsContextValue.emit("client-join-room", { name: name });
      wsContextValue.on("notification", (data) => {
        message.warning({
          content: "Trò chơi đã được bắt đầu. Vui lòng tham gia phòng khác!!!",
          key: "can-not-join-noti",
        });
        return setStep("join");
      });
      wsContextValue.on("client-join-room", (data) => {
        document.getElementById("background_sound").play();
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
        document.getElementById("background_sound").play();
        return setStep("final-host");
      });
    }
  };
  return (
    <>
      <audio id="background_sound" style={{ display: 'none' }} autoplay controls>
        <source src="/sound_background.wav" />
      </audio>
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
                <div className="home-screen-btn" onClick={onEnter}>
                  ENTER
                </div>
              </>
            )}
            {step === "2" && (
              <>
                <div className="home-screen-btn" onClick={onCreateRoom}>
                  TẠO PHÒNG
                </div>
                <div className="home-screen-btn" onClick={onJoinRoom}>
                  THAM GIA
                </div>
              </>
            )}
            {step === "join" && listRoom.length === 0 && (
              <Empty description="Chưa có phòng nào" />
            )}
            {step === "join" && listRoom.length > 0 && (
              <>
                {listRoom.map((item, id) => (
                  <div
                    className="home-screen-room"
                    onClick={() => onClickRoom(item?.["room name"])}
                  >
                    <Space size={0} direction="vertical">
                      <strong style={{ fontSize: 16 }}>
                        {item?.["room name"]}
                      </strong>
                      <div style={{ fontSize: 12, color: "#f0f0f0" }}>
                        Có {item?.total} người tham gia
                      </div>
                    </Space>
                  </div>
                ))}
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
                <div className="home-screen-btn" onClick={onEnterRoom}>
                  ENTER
                </div>
              </>
            )}
            {/* {step === 4 && history.push()} */}
          </div>
        </div>
      ) : (
        <PlayScreen
          role={step?.includes("host") ? "host" : "player"}
          name={name}
          roomName={roomName}
        />
      )}
    </>
  );
};

export default HomeScreen;
