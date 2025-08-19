import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Headers */}
      <div className="flex justify-center space-x-4 border-b mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
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

      {/* Content */}
      <div>{tabs[active].content}</div>
    </div>
  );
}
