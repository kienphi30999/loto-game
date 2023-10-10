import "./style.scss";

const City = ({ children }) => {
  return (
    <div className="play-screen--city">
      <img
        className="play-screen--city-background"
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/221808/sky.jpg"
        alt=""
      />
      {Array.from({ length: 300 }, (_, i) => i + 1).map((item, idx) => {
        return (
          <div key={item} className="circle-container">
            <div className="circle" />
          </div>
        );
      })}
      {children}
    </div>
  );
};

export default City;
