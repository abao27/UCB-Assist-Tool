import { useState } from "react";

export default function Tabs({ tabs, onChange }) {
  const [active, setActive] = useState(0);

  const handleClick = (idx) => {
    setActive(idx);
    if (onChange) onChange(idx);
  };

  return (
    <div>
      <div className="flex justify-center space-x-4 border-b mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`p-2 font-inter ${
              active === idx
                ? "border-b-2 border-[#FDB515] text-[#002676] font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}
