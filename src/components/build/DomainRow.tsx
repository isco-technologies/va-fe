import { useState, useEffect } from "react";
import apiClient from "../../api/Axios";
import ControlRow from "./ControlRow";
import AddDomainModal from "./AddDomainModal";
import AddControlModal from "./AddControlModal";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  domain: any;
  checklistId: string;
  index?: number;
  onChanged: () => void;
};

export default function DomainRow({
  domain,
  checklistId,
  index,
  onChanged,
}: Props) {

  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [showAddControlModal, setShowAddControlModal] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");

  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // FETCH QUESTIONS WHEN DOMAIN OPENS
  useEffect(() => {

    if (!open) return;
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await apiClient.get(
          `/domains/${domain.id}/questions`
        );
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [open, domain.id]);

  // DELETE DOMAIN
  const handleDelete = async () => {

    const confirmDelete = window.confirm(
      `Delete domain "${domain.name}"?`
    );

    if (!confirmDelete) return;

    try {

      setLoadingDelete(true);

      await apiClient.delete(`/domains/${domain.id}`);

      onChanged();

    } catch (err: any) {

      alert(err?.response?.data?.message || "Failed to delete domain.");

    } finally {

      setLoadingDelete(false);

    }
  };

  // UPDATE DOMAIN
  const handleUpdate = async (data: { name: string; description?: string }) => {

    await apiClient.put(`/domains/${domain.id}`, {
      name: data.name,
      description: data.description || "",
    });

    setShowEditModal(false);
    onChanged();
  };

  // ADD DOMAIN QUESTION
  const handleAddDomainQuestion = async () => {

    if (!questionText.trim()) return;

    try {

      setLoadingQuestion(true);

      const res = await apiClient.post(
        `/domains/${domain.id}/questions`,
        { text: questionText.trim() }
      );

      setQuestions(prev => [...prev, res.data]);

      setQuestionText("");
      setShowAddQuestion(false);

    } catch (err: any) {

      alert(err?.response?.data?.message || "Failed to add question.");

    } finally {

      setLoadingQuestion(false);

    }
  };

  // UPDATE DOMAIN QUESTION
  const handleUpdateDomainQuestion = async () => {

    if (!editingQuestionId) return;

    await apiClient.put(
      `/domains/${domain.id}/questions/${editingQuestionId}`,
      { text: editingQuestionText }
    );

    setQuestions(prev =>
      prev.map(q =>
        q.id === editingQuestionId
          ? { ...q, text: editingQuestionText }
          : q
      )
    );

    setEditingQuestionId(null);
    setEditingQuestionText("");
  };

  // DELETE DOMAIN QUESTION
  const handleDeleteDomainQuestion = async () => {

    if (!deletingQuestionId) return;

    await apiClient.delete(`/questions/${deletingQuestionId}`);
    

    setQuestions(prev =>
      prev.filter(q => q.id !== deletingQuestionId)
    );

    setDeletingQuestionId(null);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* HEADER */}

        <div className="px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setOpen(!open)}
              className="text-slate-500 hover:text-slate-700"
            >
              {open ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
            </button>

            <div>

              <div className="font-semibold text-slate-800">

                {index !== undefined && (
                  <span className="text-slate-400 mr-2">
                    Domain {index + 1}
                  </span>
                )}

                {domain.name}

              </div>

              <div className="text-sm text-slate-500">
                {domain.description || "No description"}
              </div>

            </div>

          </div>

          <div className="flex items-center gap-6">

            <div className="text-sm text-slate-500">
              Controls:
              <span className="ml-1 font-medium text-slate-700">
                {domain.controls?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">

              <button
                onClick={() => setShowEditModal(true)}
                className="hover:text-indigo-600"
              >
                <Pencil size={16}/>
              </button>

              <button
                onClick={handleDelete}
                disabled={loadingDelete}
                className="hover:text-red-600"
              >
                <Trash2 size={16}/>
              </button>

            </div>

          </div>

        </div>

        {/* BODY */}

        {open && (

          <div className="px-6 py-4 space-y-4">

            {loadingQuestions && (
              <div className="text-sm text-slate-500">
                Loading questions...
              </div>
            )}

            {/* DOMAIN QUESTIONS */}

            {questions.map((q:any)=>{

              const isEditing = editingQuestionId === q.id;
              const isDeleting = deletingQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="flex justify-between items-start bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg p-3"
                >
                  <div className="flex-1">
                    {isEditing ? (
                      <>
                        <input
                          value={editingQuestionText}
                          onChange={(e)=>setEditingQuestionText(e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />

                        <div className="flex gap-2 mt-2">

                          <button
                            onClick={()=>setEditingQuestionId(null)}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handleUpdateDomainQuestion}
                            className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                          >
                            Save
                          </button>

                        </div>
                      </>
                    ) : isDeleting ? (

                      <>
                        <div className="text-red-600">
                          Delete this question?
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={()=>setDeletingQuestionId(null)}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteDomainQuestion}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <span>• {q.text}</span>
                    )}
                  </div>
                  {!isEditing && !isDeleting && (
                    <div className="flex gap-1">

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

                </div>

              );

            })}

            {/* ADD QUESTION */}

            {showAddQuestion ? (

              <div>

                <input
                  value={questionText}
                  onChange={(e)=>setQuestionText(e.target.value)}
                  placeholder="Enter question..."
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />

                <div className="flex justify-end gap-2 mt-2">

                  <button
                    onClick={()=>setShowAddQuestion(false)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddDomainQuestion}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                  >
                    {loadingQuestion ? "Adding..." : "Add"}
                  </button>

                </div>

              </div>

            ) : (

              <button
                onClick={()=>setShowAddQuestion(true)}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Add Question
              </button>

            )}

            {/* CONTROLS */}

            <div className="flex justify-between items-center pt-2">

              <p className="text-xs text-slate-500">
                Controls are optional.
              </p>

              <button
                onClick={() => setShowAddControlModal(true)}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Add Control
              </button>

            </div>

            {domain.controls?.length ? (

              <div className="space-y-3">

                {domain.controls.map((c:any)=>(
                  <ControlRow
                    key={c.id}
                    control={c}
                    onChanged={onChanged}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                No controls yet.
              </div>

            )}

          </div>

        )}

      </div>

      {/* MODALS */}

      <AddDomainModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        initialData={{
          name: domain.name,
          description: domain.description || "",
        }}
      />

      <AddControlModal
        open={showAddControlModal}
        checklistId={checklistId}
        domainId={domain.id}
        onClose={() => setShowAddControlModal(false)}
        onSaved={() => {
          setShowAddControlModal(false);
          setOpen(true);
          onChanged();
        }}
      />
    </>
  );
}