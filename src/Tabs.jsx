import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab headers */}
      <div className="flex justify-center space-x-4 border-b mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`p-2 ${
              active === idx
                ? "border-b-2 border-blue-600 font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Tab content */}
      <div>{tabs[active].content}</div>
    </div>
  );
}
