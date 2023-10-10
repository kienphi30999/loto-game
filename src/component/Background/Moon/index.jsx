import "./style.scss";

const Moon = ({ children }) => {
  return (
    <div className="play-screen--moon">
      <div className="stars" />
      <div className="twinkling" />
      <div className="clouds" />
      {children}
    </div>
  );
};

export default Moon;
