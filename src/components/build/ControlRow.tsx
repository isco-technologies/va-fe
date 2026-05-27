import { useState, useEffect } from "react";
import apiClient from "../../api/Axios";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  control: any;
  onChanged: () => void;
};

export default function ControlRow({ control, onChanged }: Props) {

  const [open, setOpen] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [editCode, setEditCode] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRiskWeight, setEditRiskWeight] = useState<number>(1);

  const [error, setError] = useState<string | null>(null);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [, setLoadingQuestionUpdate] = useState(false);

  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [, setLoadingDeleteQuestion] = useState(false);

  const basePath = `/controls/${control.id}`;

  useEffect(() => {
    setEditCode(control.code || "");
    setEditTitle(control.title || "");
    setEditRiskWeight(control.riskWeight ?? 1);
  }, [control]);

  const isEditValid =
    editCode.trim().length > 0 && editTitle.trim().length > 0;

  // DELETE CONTROL
  const handleDeleteControl = async () => {

    const ok = window.confirm(
      `Delete control "${control.code} — ${control.title}"?`
    );

    if (!ok) return;

    try {

      setLoadingDelete(true);
      await apiClient.delete(basePath);
      onChanged();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to delete control.");

    } finally {

      setLoadingDelete(false);

    }
  };

  // UPDATE CONTROL
  const handleUpdateControl = async () => {

    if (!isEditValid || loadingUpdate) return;

    try {

      setLoadingUpdate(true);
      setError(null);

      await apiClient.put(basePath, {

        code: editCode.trim(),
        title: editTitle.trim(),
        riskWeight:
          Number(editRiskWeight) > 0 ? Number(editRiskWeight) : 1,

      });

      setShowEdit(false);
      onChanged();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to update control.");

    } finally {

      setLoadingUpdate(false);

    }
  };

  // ADD QUESTION
  const handleAddQuestion = async () => {

    if (!questionText.trim()) return;

    try {

      setLoadingQuestion(true);

      await apiClient.post(`${basePath}/questions`, {

        text: questionText.trim(),

      });

      setQuestionText("");
      setShowAddQuestion(false);
      setOpen(true);

      onChanged();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to add question.");

    } finally {

      setLoadingQuestion(false);

    }
  };

  // UPDATE QUESTION
  const handleUpdateQuestion = async () => {

    if (!editingQuestionId) return;

    try {

      setLoadingQuestionUpdate(true);

      await apiClient.put(
        `${basePath}/questions/${editingQuestionId}`,
        { text: editingQuestionText }
      );

      setEditingQuestionId(null);
      setEditingQuestionText("");

      onChanged();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to update question.");

    } finally {

      setLoadingQuestionUpdate(false);

    }
  };

  // DELETE QUESTION
  const handleDeleteQuestion = async () => {

    if (!deletingQuestionId) return;

    try {

      setLoadingDeleteQuestion(true);

      await apiClient.delete(
        `${basePath}/questions/${deletingQuestionId}`
      );

      setDeletingQuestionId(null);

      onChanged();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to delete question.");

    } finally {

      setLoadingDeleteQuestion(false);

    }
  };

  return (

    <div className="bg-slate-50 border border-slate-200 rounded-lg">

      {/* HEADER */}

      <div className="px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button
            onClick={() => setOpen(!open)}
            className="text-slate-500 hover:text-slate-700"
          >
            {open ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          </button>

          <div>

            <div className="font-medium text-slate-800">
              {control.code} — {control.title}
            </div>

            <div className="text-xs text-slate-500">
              Risk Weight: {control.riskWeight}
            </div>

          </div>

        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-1">

            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-indigo-600"
            >
              <Pencil size={16}/>
            </button>

            <button
              onClick={handleDeleteControl}
              disabled={loadingDelete}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-red-600"
            >
              <Trash2 size={16}/>
            </button>

          </div>

          <button
            onClick={() => setShowAddQuestion(true)}
            className="text-indigo-600 text-sm font-medium hover:underline"
          >
            + Add Question
          </button>

        </div>

      </div>

      {error && (
        <div className="px-4 pb-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* EDIT CONTROL */}

      {showEdit && (

        <div className="border-t px-4 py-3 bg-white">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              value={editRiskWeight}
              onChange={(e) =>
                setEditRiskWeight(Number(e.target.value))
              }
              className="border rounded-md px-3 py-2 text-sm"
            />

          </div>

          <div className="mt-3 flex justify-end gap-2">

            <button
              onClick={() => setShowEdit(false)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateControl}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              {loadingUpdate ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* ADD QUESTION */}

      {showAddQuestion && (

        <div className="border-t px-4 py-3 bg-white">

          <input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question..."
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          <div className="mt-3 flex justify-end gap-2">

            <button
              onClick={() => setShowAddQuestion(false)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleAddQuestion}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              {loadingQuestion ? "Adding..." : "Add"}
            </button>

          </div>

        </div>
      )}

      {/* QUESTIONS */}

      {open && (

        <div className="border-t border-slate-200 px-4 py-3">

          <ul className="space-y-2">

            {control.questions?.map((q:any)=>{

              const isEditing = editingQuestionId === q.id;
              const isDeleting = deletingQuestionId === q.id;

              return (

                <li
                  key={q.id}
                  className="flex items-start justify-between text-sm text-slate-700 hover:bg-slate-100 rounded px-2 py-2"
                >

                  <div className="flex-1">

                    {isEditing && (

                      <div className="space-y-2">

                        <input
                          value={editingQuestionText}
                          onChange={(e)=>
                            setEditingQuestionText(e.target.value)
                          }
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <div className="flex gap-2">

                          <button
                            onClick={()=>setEditingQuestionId(null)}
                            className="px-3 py-1 border rounded text-sm"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handleUpdateQuestion}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                          >
                            Save
                          </button>

                        </div>

                      </div>
                    )}

                    {isDeleting && (

                      <div className="space-y-2 text-white-600">

                        Delete this question?

                        <div className="flex gap-2">

                          <button
                            onClick={()=>setDeletingQuestionId(null)}
                            className="px-3 py-1 border rounded text-sm"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handleDeleteQuestion}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    )}

                    {!isEditing && !isDeleting && (
                      <span>• {q.text}</span>
                    )}

                  </div>

                  {!isEditing && !isDeleting && (

                    <div className="flex items-center gap-1">

                      <button
                        onClick={()=>{
                          setEditingQuestionId(q.id);
                          setEditingQuestionText(q.text);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-indigo-600"
                      >
                        <Pencil size={14}/>
                      </button>
                      <button
                        onClick={()=>setDeletingQuestionId(q.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}