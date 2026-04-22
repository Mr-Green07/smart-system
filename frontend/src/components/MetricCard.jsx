const MetricCard = ({ title, value, change }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-gray-500">{title}</h3>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-green-500">{change}</p>
    </div>
  );
};

export default MetricCard;