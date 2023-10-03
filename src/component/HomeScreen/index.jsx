import { useContext, useEffect, useState } from "react";
import { Empty, Input, Space } from "antd";
import { wsContext } from "../../context";
import "./style.css";
import PlayScreen from "../PlayScreen";
import { Link } from "react-router-dom";
// import {useHis} from 'react-router-dom'

const HomeScreen = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [listRoom, setListRoom] = useState([]);
  const wsContextValue = useContext(wsContext);
  // const history = useHistory();
  const onEnter = () => {
    if (name) {
      setStep(2);
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
      setStep("final");
      wsContextValue.emit("client-join-room", { name: name });
    }
  };
  const onEnterRoom = () => {
    if (roomName) {
      setStep("final");
      wsContextValue.emit("client-create-room", { name: roomName });
    }
  };
  return (
    <>
      {step === "final" ? (
        <div className="home-screen-container">
          <div className="home-screen-action">
            {step === 1 && (
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
            {step === 2 && (
              <>
                <div className="home-screen-btn" onClick={onCreateRoom}>
                  TẠO PHÒNG
                </div>
                <div className="home-screen-btn" onClick={onJoinRoom}>
                  THAM GIA
                </div>
              </>
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
            {step === "join" && listRoom.length === 0 && (
              <Empty description="Chưa có phòng nào" />
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
        <PlayScreen />
      )}
    </>
  );
};

export default HomeScreen;
