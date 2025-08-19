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

  // Get all unique Berkeley courses, sorted alphabetically
  const berkeleyCourses = [...new Set(rows.map((r) => r.b_course))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Get all unique community colleges, sorted alphabetically
  const communityColleges = [...new Set(rows.map((r) => r.cc_name))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const equivalents =
    berkeleyCourse !== "" ? rows.filter((r) => r.b_course === berkeleyCourse) : [];

  const correspondences =
    communityCollege !== "" ? rows.filter((r) => r.cc_name === communityCollege) : [];

  return (
    <div className="p-6 flex flex-col items-center min-h-screen">
      {/* Header */}
      <h1 className="font-serif4 text-2xl mb-6 text-center w-full py-4 bg-[#002676]">
        <span className="text-bold text-[#FDB515]">UC Berkeley</span>{"  "}
        <span className="text-white">Assist Tool</span>
      </h1>

      <Tabs
        tabs={[
          {
            label: "By UC Berkeley Course",
            content: (
              <div className="flex flex-col items-center">
                <p className="mb-4 text-gray-700 text-center max-w-xl text-base">
                  Select a UC Berkeley course to view its community college equivalents.
                </p>

                <select
                  className="border p-2 mb-4 w-64 text-sm"
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
                  <table className="border text-center w-[700px]">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Community College</th>
                        <th className="border px-4 py-2">Equivalent Course</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {equivalents.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-4 py-2">{row.cc_name}</td>
                          <td className="border px-4 py-2">{row.cc_course}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {correspondences.length > 0 && (
                  <table className="border text-center w-[700px]">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Berkeley Course</th>
                        <th className="border px-4 py-2">Equivalent Course</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {correspondences.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-4 py-2">{row.b_course}</td>
                          <td className="border px-4 py-2">{row.cc_course}</td>
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
              <div className="flex flex-col items-center">
                <p className="mb-4 text-gray-700 text-center max-w-xl">
                  Select a community college to see its articulated UC Berkeley courses.
                </p>

                <select
                  className="border p-2 mb-4 w-64 text-sm"
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
                  <table className="border text-center">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Berkeley Course</th>
                        <th className="border px-4 py-2">Equivalent Course</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {correspondences.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-4 py-2">{row.b_course}</td>
                          <td className="border px-4 py-2">{row.cc_course}</td>
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

      {/* Disclaimer */}
      <p className="fixed bottom-0 left-0 w-full bg-white bg-opacity-90 
                   text-sm text-gray-500 text-center py-2 shadow-md">
        <span className="font-bold">Disclaimer:</span> This site is an independent
        project and is not affiliated with UC Berkeley or Assist.org. Please verify
        all course articulations through{" "}
        <a
          href="https://assist.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          official sources
        </a>.
      </p>
    </div>
  );
}

export default App;
