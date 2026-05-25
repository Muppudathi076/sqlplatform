import { useEffect, useState, useRef } from "react"
import { Pencil, Trash2, Filter, Plus, FileDown, Upload, X, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import ReusableTable from "../ReusableComponents/ReusableTable"
import toast from "react-hot-toast"
import { addQuestionApi, questiondeleteByIdApi, QuestionGetAllApi, questionUpdatedByIdApi, bulkImportQuestionsApi, bulkDeleteQuestionsApi, aiBulkGenerateQuestionsApi } from "../../auth/AdminAuthApi"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"

type Question = {
  id: number
  question: string
  difficulty: string
  model_no: number
}

function QuestionPage() {

  const { id } = useParams()
  const token = localStorage.getItem("access_token") || ""

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [models, setModels] = useState<number[]>([])
  const [difficulties, setDifficulties] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [modelFilter, setModelFilter] = useState<string>(id || "")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // AI Generation State
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState("easy")
  const [aiCount, setAiCount] = useState(10)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    difficulty: "easy",
    answer: "",
  })

  const fetching = async () => {
    setLoading(true)
    try {
      const response = await QuestionGetAllApi(token)
      const data: Question[] = response.data
      setQuestions(data)
      const uniqueModels = [...new Set(data.map((q: any) => q.model_no))]
      setModels(uniqueModels)

      const uniqueDifficulties = [...new Set(data.map((q: any) => q.difficulty))]
      setDifficulties(uniqueDifficulties)
    } catch (e) {
      console.log("API Error:", e)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  const filteredData = questions.filter((q: any) => {
    const modelMatch = modelFilter ? String(q.model_no) === String(modelFilter) : true;
    const diffMatch = difficultyFilter ? String(q.difficulty).toLowerCase() === String(difficultyFilter).toLowerCase() : true;
    return modelMatch && diffMatch;
  })

  useEffect(() => {
    fetching()
  }, [])

  const handleSubmit = async () => {
    try {
      if (isEdit && editIndex !== null) {
        const questionId = questions[editIndex].id

        await questionUpdatedByIdApi(
          questionId,
          token,
          formData
        )

        await fetching()
        toast.success("Question updated successfully")
      } else {
        const payload = {
          ...formData,
          model_no: id
        }

        const res = await addQuestionApi(token, payload)

        setQuestions((prev) => [...prev, res.data])
        toast.success("Question added successfully")
      }

      setShowModal(false)
      setFormData({
        question: "",
        difficulty: "easy",
        answer: ""
      })
      setIsEdit(false)
      setEditIndex(null)

    } catch (e: any) {
      console.log("submit api error:", e)

      const backendMessage =
        e.response?.data?.errors?.non_field_errors?.[0] ||
        e.response?.data?.message ||
        "Something went wrong"

      toast.error(backendMessage)
    }
  }

  const handleEdit = (index: number) => {
    const q = questions[index]

    setFormData({
      question: q.question,
      difficulty: q.difficulty,
      answer: q.answer
    })

    setEditIndex(index)
    setIsEdit(true)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      if (deleteIndex !== null) {
        await questiondeleteByIdApi(deleteIndex, token)
        // setQuestions(updated)
        await fetching()
        toast.success("Deleted successfully")
        setShowDeleteModal(false)
      }
    } catch (e: any) {
      console.log("delete api", e)
      toast.error("Some went wrong", { duration: 2000 })
    }
  }

  // ✅ SELECT BOX
  const handleSelect = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(i => i !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  // ✅ BULK DELETE
  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      const ids = selectedRows
      await bulkDeleteQuestionsApi(ids, token)
      toast.success(`${ids.length} question(s) deleted!`)
      setSelectedRows([])
      setShowBulkDeleteModal(false)
      await fetching()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Bulk delete failed")
    } finally {
      setBulkDeleting(false)
    }
  }

  // ✅ AI GENERATE
  const handleAIGenerate = async () => {
    setAiGenerating(true)
    try {
      const res = await aiBulkGenerateQuestionsApi(aiDifficulty, aiCount, token)
      toast.success(res.message || `${res.created} questions generated successfully!`)
      setShowAIModal(false)
      await fetching()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to generate AI questions")
    } finally {
      setAiGenerating(false)
    }
  }

  const columns = [
    {
      header: "",
      accessor: "select",
      cell: (row: any) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => handleSelect(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    { header: "Question", accessor: "question" },
    { header: "Difficulty", accessor: "difficulty" },
    { header: "Model No", accessor: "model_no" },
    { header: "Answer", accessor: "answer" },
  ]
  const hasData = filteredData.length > 5

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="p-5 md:p-8 min-h-screen bg-transparent transition-colors duration-500"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Question Bank</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage and organize all questions across models.</p>
        </div>
        <div className="flex gap-3 relative items-center">
          {/* Bulk Delete Button - visible only when rows are selected */}
          <AnimatePresence>
            {selectedRows.length > 0 && (
              <motion.button
                key="bulk-delete"
                initial={{ opacity: 0, scale: 0.85, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 text-sm font-semibold"
              >
                <Trash2 size={16} />
                <span>Delete ({selectedRows.length})</span>
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setShowModal(true)
              setIsEdit(false)
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>

          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">AI Generate</span>
          </button>

          {/* Bulk Upload Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUploadMenu(!showUploadMenu)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>
            <AnimatePresence>
              {showUploadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-2 w-48 z-50 flex flex-col gap-1"
                >
                  <button
                    onClick={() => {
                      setShowUploadMenu(false)
                      // Only headers + 1 sample row for reference
                      const templateData = [
                        {
                          question: "Write a query to select all employees from the employees table",
                          methods: "SELECT",
                          difficulty: "easy",
                          model_no: 1,
                          answer: "SELECT * FROM employees",
                          option: "",
                          sample_data: "[]"
                        }
                      ]
                      const ws = XLSX.utils.json_to_sheet(templateData, {
                        header: ["question", "methods", "difficulty", "model_no", "answer", "option", "sample_data"]
                      })
                      ws["!cols"] = [
                        { wch: 60 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 60 }, { wch: 20 }, { wch: 30 }
                      ]
                      const wb = XLSX.utils.book_new()
                      XLSX.utils.book_append_sheet(wb, ws, "Questions")
                      XLSX.writeFile(wb, "questions_template.xlsx", { bookType: "xlsx", type: "binary" })
                      toast.success("Template downloaded!")
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
                  >
                    <FileDown size={16} className="text-emerald-500" />
                    Template (Excel)
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadMenu(false)
                      importInputRef.current?.click()
                    }}
                    disabled={importing}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {importing ? <Loader2 size={16} className="animate-spin text-violet-500" /> : <Upload size={16} className="text-violet-500" />}
                    Import Data
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden file input */}
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setImporting(true)
              try {
                const ab = await file.arrayBuffer()
                const wb = XLSX.read(ab)
                const ws = wb.Sheets[wb.SheetNames[0]]
                const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
                if (rows.length === 0) { toast.error("No data found in file"); return }
                const res = await bulkImportQuestionsApi(rows, token)
                setImportResult({ created: res.created, errors: res.errors || [] })
                await fetching()
              } catch (err: any) {
                toast.error(err?.response?.data?.error || "Import failed")
              } finally {
                setImporting(false)
                e.target.value = ""
              }
            }}
          />

          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Filter size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-14 right-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-5 w-64 z-50"
              >

                <div className="mb-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">Model</label>
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl mt-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">All Models</option>
                    {models.map((m, i) => (
                      <option key={i} value={m}>
                        Model {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">Difficulty</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl mt-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map((d, i) => (
                      <option key={i} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setModelFilter(id || "")
                    setDifficultyFilter("")
                  }}
                  className="w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-xl font-medium transition-colors"
                >
                  Reset Filters
                </button>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-500">
        <ReusableTable
          columns={columns}
          data={filteredData}
          pagination={true}
          hasData={hasData}
          isLoading={loading}
          height="350px"
          actions={(row: any) => {
            const index = filteredData.findIndex((u) => u.id === row.id)
            return (
              <div className="flex gap-2 justify-center">
                <button onClick={() => handleEdit(index)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110 active:scale-95">
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => {
                    setDeleteIndex(index)
                    setShowDeleteModal(true)
                  }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          }}
        />
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEdit ? "Edit Question" : "Add New Question"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
                  <textarea
                    placeholder="Enter question details..."
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label>
                  <textarea
                    placeholder="Enter correct answer..."
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all font-medium"
                >
                  {isEdit ? "Update Question" : "Save Question"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Question</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex-1"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-600/20 transition-all font-medium flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Selected Questions</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-500">{selectedRows.length} question(s)</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={bulkDeleting}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-600/20 transition-all font-medium flex-1 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {bulkDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : "Delete All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Generate</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  >
                    <option value="easy">Easy (Model 1)</option>
                    <option value="medium">Medium (Model 2)</option>
                    <option value="hard">Hard (Model 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">Will generate {aiCount} distinct questions and save to database automatically.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-md shadow-purple-500/20 transition-all font-medium disabled:opacity-70"
                >
                  {aiGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Result Modal */}
      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-7 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Complete</h2>
                </div>
                <button onClick={() => setImportResult(null)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <X size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 mb-4">
                <p className="text-green-800 dark:text-green-300 font-bold text-lg">✅ {importResult.created} question(s) imported successfully!</p>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">{importResult.errors.length} row(s) had errors:</span>
                  </div>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 py-0.5">{err}</p>
                  ))}
                </div>
              )}

              <button
                onClick={() => setImportResult(null)}
                className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default QuestionPage