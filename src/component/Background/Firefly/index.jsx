import "./style.sass";

const Firefly = ({ children }) => {
  return (
    <div className="play-screen--firefly">
      {Array.from({ length: 100 }, (_, i) => i + 1).map((item, idx) => {
        return <div key={idx} className="firefly" />;
      })}
      {children}
    </div>
  );
};

export default Firefly;
