import "./style.scss";

const Bubble = ({ children }) => {
  return (
    <div className="play-screen--bubble">
      {Array.from({ length: 50 }, (_, i) => i + 1).map((item, idx) => {
        return <div key={idx} className="bubble" />;
      })}
      {children}
    </div>
  );
};

export default Bubble;
