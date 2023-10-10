import "./style.css";

const Snow = ({ children }) => {
  return (
    <div className="play-screen--snow">
      {Array.from({ length: 200 }, (_, i) => i + 1).map((item, idx) => {
        return <div key={idx} className="snow" />;
      })}
      {children}
    </div>
  );
};

export default Snow;
