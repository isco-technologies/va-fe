import { useParams } from "react-router-dom";
import AppLayout from "../../layouts/appLayout";
import { useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from "react";
import { useAppDispatch } from "../../feature/hooks/useAppDispatch";
import { useAppSelector } from "../../feature/hooks/useAppSelector";
import { fetchAssessments } from "../../feature/assessments/assessmentSlice";



const AssessmentForm = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { assessment, domains, isLoading } = useAppSelector(
    (state) => state.assessments.details
  );

  useEffect(() => {
    dispatch(fetchAssessments(id!));
  }, [dispatch, id]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold">
            {assessment?.company.name} – {assessment?.checklist.name}
          </h1>
        </div>

        {/* Domains */}
        {domains.map((domain: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; controls: any[]; }) => (
          <div key={domain.id} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {domain.name}
            </h2>

            {domain.controls.map((control) => (
              <div
                key={control.id}
                className="border-b py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {control.code} – {control.title}
                  </p>
                </div>

                {/* Answer Buttons */}
                <div className="flex gap-2">
                  {["YES", "NO", "NA"].map((value) => (
                    <button
                      key={value}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

      </div>
    </AppLayout>
  );
};

export default AssessmentForm;