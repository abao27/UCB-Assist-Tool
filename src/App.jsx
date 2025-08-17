import { useEffect, useState } from "react";
import Papa from "papaparse";
import Tabs from "./Tabs";

function App() {
  const [rows, setRows] = useState([]);
  const [berkeleyCourse, setBerkeleyCourse] = useState("");
  const [communityCollege, setCommunityCollege] = useState("");

  // load and parse the CSV on startup
  useEffect(() => {
    fetch("/src/data/articulations.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const result = Papa.parse(csvText, { header: true });
        setRows(result.data);
      });
  }, []);

  // Get all unique Berkeley courses
  const berkeleyCourses = [...new Set(rows.map((r) => r.b_course))].filter(Boolean);

  // Get all unique community colleges
  const communityColleges = [...new Set(rows.map((r) => r.cc_name))].filter(Boolean);

  // Case 1: If a UC Berkeley course is selected, show all community college equivalents
  const equivalents =
    berkeleyCourse !== ""
      ? rows.filter((r) => r.b_course === berkeleyCourse)
      : [];

  // Case 2: If a community college is selected, show all correspondences
  const correspondences =
    communityCollege !== ""
      ? rows.filter((r) => r.cc_name === communityCollege)
      : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">UC Berkeley Assist Tool</h1>
      <Tabs
        tabs={[
          {
            label: "By Berkeley Course",
            content: (
              <div>
                <select
                  className="border p-2 mb-4"
                  value={berkeleyCourse}
                  onChange={(e) => setBerkeleyCourse(e.target.value)}
                >
                  <option value="">-- Select a Berkeley Course --</option>
                  {berkeleyCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {equivalents.length > 0 && (
                  <table className="border">
                    <thead>
                      <tr>
                        <th className="border px-2">Community College</th>
                        <th className="border px-2">Equivalent Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equivalents.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-2">{row.cc_name}</td>
                          <td className="border px-2">{row.cc_course}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ),
          },
          {
            label: "By Community College",
            content: (
              <div>
                <select
                  className="border p-2 mb-4"
                  value={communityCollege}
                  onChange={(e) => setCommunityCollege(e.target.value)}
                >
                  <option value="">-- Select a Community College --</option>
                  {communityColleges.map((cc) => (
                    <option key={cc} value={cc}>
                      {cc}
                    </option>
                  ))}
                </select>

                {correspondences.length > 0 && (
                  <table className="border">
                    <thead>
                      <tr>
                        <th className="border px-2">Berkeley Course</th>
                        <th className="border px-2">Equivalent Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correspondences.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-2">{row.b_course}</td>
                          <td className="border px-2">{row.cc_course}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default App;
