const InsightCard = ({ text, type }) => {
  const color =
    type === "success"
      ? "text-green-600"
      : type === "warning"
      ? "text-yellow-600"
      : type === "danger"
      ? "text-red-600"
      : "text-blue-600";

  return (
    <div className={`bg-white p-3 rounded shadow ${color}`}>
      {text}
    </div>
  );
};

export default InsightCard;