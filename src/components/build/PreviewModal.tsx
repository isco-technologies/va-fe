import { useState } from "react";

interface Question {
  id: string;
  text: string;
}

interface Control {
  id: string;
  code: string;
  title: string;
  questions?: Question[];
}

interface Domain {
  id: string;
  name: string;
  controls?: Control[];
  questions?: Question[];
}

interface Props {
  checklistName: string;
  domains: Domain[];
}

const ChecklistPreview = ({ checklistName, domains }: Props) => {
  const [openDomainId, setOpenDomainId] = useState<string | null>(null);

  const toggleDomain = (id: string) => {
    setOpenDomainId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white p-8 text-sm text-slate-900">
      <h1 className="text-xl font-bold mb-6">{checklistName}</h1>

      {domains.map((domain, domainIndex) => {
        const isOpen = openDomainId === domain.id;

        return (
          <div key={domain.id} className="mb-6 border rounded-lg">

            {/* DOMAIN HEADER */}
            <div
              onClick={() => toggleDomain(domain.id)}
              className="cursor-pointer bg-slate-100 px-4 py-3 flex justify-between items-center"
            >
              <h2 className="font-semibold">
                Domain {String.fromCharCode(65 + domainIndex)} - {domain.name}
              </h2>

              <span className="text-sm text-slate-500">
                {isOpen ? "▲ Collapse" : "▼ Expand"}
              </span>
            </div>

            {isOpen && (
              <div className="p-4">

                <table className="w-full border border-slate-400 border-collapse">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-400 p-2 w-20">No</th>
                      <th className="border border-slate-400 p-2 w-48">Controls</th>
                      <th className="border border-slate-400 p-2">
                        Assessment Requirements
                      </th>
                      <th className="border border-slate-400 p-2 w-16">YES</th>
                      <th className="border border-slate-400 p-2 w-16">NO</th>
                      <th className="border border-slate-400 p-2 w-16">N/A</th>
                      <th className="border border-slate-400 p-2 w-48">
                        Findings / Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {/* CASE 1 — DOMAIN HAS CONTROLS */}
                    {domain.controls && domain.controls.length > 0 ? (

                      domain.controls.map((control) => {

                        if (!control.questions || control.questions.length === 0) {
                          return (
                            <tr key={control.id}>
                              <td className="border p-2 text-center">
                                {control.code}
                              </td>

                              <td className="border p-2">
                                {control.title}
                              </td>

                              <td className="border p-2 text-gray-500 italic">
                                No questions
                              </td>

                              <td className="border text-center">☐</td>
                              <td className="border text-center">☐</td>
                              <td className="border text-center">☐</td>
                              <td className="border"></td>
                            </tr>
                          );
                        }

                        return control.questions.map((question, questionIndex) => (
                          <tr key={question.id}>

                            {questionIndex === 0 && (
                              <>
                                <td
                                  rowSpan={control.questions?.length || 1}
                                  className="border border-slate-400 p-2 text-center align-top"
                                >
                                  {control.code}
                                </td>

                                <td
                                  rowSpan={control.questions?.length || 1}
                                  className="border border-slate-400 p-2 align-top"
                                >
                                  {control.title}
                                </td>
                              </>
                            )}

                            <td className="border border-slate-400 p-2">
                              {questionIndex + 1}. {question.text}
                            </td>

                            <td className="border text-center">☐</td>
                            <td className="border text-center">☐</td>
                            <td className="border text-center">☐</td>
                            <td className="border"></td>

                          </tr>
                        ));
                      })

                    ) : domain.questions && domain.questions.length > 0 ? (

                      /* CASE 2 — DOMAIN QUESTIONS (NO CONTROLS) */

                      domain.questions.map((question, index) => (
                        <tr key={question.id}>

                          <td className="border border-slate-400 p-2 text-center">
                            N/A
                          </td>

                          <td className="border border-slate-400 p-2">
                            N/A
                          </td>

                          <td className="border border-slate-400 p-2">
                            {index + 1}. {question.text}
                          </td>

                          <td className="border text-center">☐</td>
                          <td className="border text-center">☐</td>
                          <td className="border text-center">☐</td>
                          <td className="border"></td>

                        </tr>
                      ))

                    ) : (

                      /* CASE 3 — NOTHING */

                      <tr>
                        <td
                          colSpan={7}
                          className="border border-slate-400 p-4 text-center text-gray-500 italic"
                        >
                          No controls or questions defined
                        </td>
                      </tr>

                    )}

                  </tbody>
                </table>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistPreview;