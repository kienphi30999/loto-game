import { Button, Result, Space } from "antd";

const Congrat = ({ role, name, playerName, numberList, onReplay, onOut }) => {
  console.log(role);
  return (
    <Result
      status="success"
      title={<div style={{ fontWeight: "bold" }}>Bingo</div>}
      subTitle={
        <div>
          <div style={{ fontSize: 18, color: "#000000" }}>
            Xin chúc mừng{" "}
            {name !== playerName ? <b>{playerName}</b> : <b>bạn</b>} đã chiến
            thắng
          </div>
          <Space size={12}>
            {numberList?.map((item) => (
              <div
                key={item}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid #000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#000000",
                  fontWeight: 600,
                  marginTop: 12,
                }}
              >
                {item}
              </div>
            ))}
          </Space>
          {role === "player" && (
            <div style={{ marginTop: 16, color: "red", fontSize: 16 }}>
              Đang chờ chủ phòng phản hồi. Vui lòng KHÔNG THOÁT hay F5 ngay lúc
              này
            </div>
          )}
        </div>
      }
      {...(role === "host" && {
        extra: [
          <Button onClick={onReplay} type="primary" key="replay">
            Chơi lại
          </Button>,
          <Button onClick={onOut} key="out-room">
            Rời khỏi phòng
          </Button>,
        ],
      })}
      // extra={
      //   role === "host"
      //     ? [
      //         <Button type="primary" key="console">
      //           Chơi lại
      //         </Button>,
      //         <Button key="buy">Rời khỏi phòng</Button>,
      //       ]
      //     : []
      // }
    />
  );
};

export default Congrat;
