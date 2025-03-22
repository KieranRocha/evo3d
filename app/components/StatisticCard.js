import React from "react";

const StatisticCard = ({ statistic }) => {
  return (
    <div className=" rounded-3xl p-8 md:p-10 flex flex-col items-center  transform transition-transform duration-300 hover:scale-105 ">
      <h2 className="text-blue-700 text-6xl md:text-8xl font-bold drop-shadow-glow ">
        {statistic.number}
      </h2>
      <h3 className="text-secondary text-xl font-poppins mt-6 font-bold">
        {statistic.title}
      </h3>
    </div>
  );
};

export default StatisticCard;
