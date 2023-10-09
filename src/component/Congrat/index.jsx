import { useEffect } from "react";
import useSound from "use-sound";
import "./style.css";
import "./confetti.scss";
import { Space } from "antd";

const Congrat = ({ role, name, playerName, numberList, onReplay, onOut }) => {
  const [bingoPlay] = useSound("/bingo.mp3", { format: ["mp3"] });
  useEffect(() => {
    bingoPlay();
  }, [bingoPlay]);

  return (
    <div className="congrat">
      {Array.from({ length: 151 }, (_, i) => i).map((item, idx) => {
        return <div key={idx} className={`confetti-${item}`} />;
      })}
      <div className="congrat-container">
        <div className="checkmark-circle">
          <div className="background"></div>
          <div className="checkmark draw"></div>
        </div>
        <div style={{ fontSize: 24 }}>Xin chúc mừng !</div>
        <div style={{ fontWeight: 900, fontSize: 36 }}>
          {name !== playerName ? playerName : "Bạn"}
        </div>
        <div style={{ fontSize: 24 }}>
          đã dành chiến thắng trò chơi SCC Loto
        </div>
        <div style={{ fontSize: 24 }}>cùng với dãy số dưới đây</div>
        <Space size={12}>
          {numberList?.map((item) => (
            <div
              key={item}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#ffffff",
                fontWeight: 600,
                marginTop: 20,
              }}
            >
              {item}
            </div>
          ))}
        </Space>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 25,
          }}
        >
          {role === "host" && (
            <div
              className="congrat-btn"
              onClick={onReplay}
              type="primary"
              key="replay"
            >
              Chơi lại
            </div>
          )}
          <div className="congrat-btn" onClick={onOut} key="out-room">
            Rời khỏi phòng
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congrat;
