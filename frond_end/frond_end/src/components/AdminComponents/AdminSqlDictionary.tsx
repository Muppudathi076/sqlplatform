import { useEffect, useState } from "react"
import { Pencil, Trash2, Plus, X, Loader2, BookOpen, Search, Download, Sparkles } from "lucide-react"
import ReusableTable from "../ReusableComponents/ReusableTable"
import toast from "react-hot-toast"
import {
  DictionaryGetAllApi,
  addDictionaryApi,
  updateDictionaryByIdApi,
  deleteDictionaryByIdApi,
  bulkDeleteDictionaryApi,
  seedDictionaryApi,
  generateAiDictionaryApi
} from "../../auth/AdminAuthApi"
import { motion, AnimatePresence } from "framer-motion"

type DictionaryEntry = {
  id: number
  keyword: string
  meaning: string
  analogy: string
  syntax: string
  example_query: string
  icon: string
  color: string
  questions: any[]
}

function AdminSqlDictionary() {
  const token = localStorage.getItem("access_token") || ""

  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [showAiModal, setShowAiModal] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiCount, setAiCount] = useState(5)

  const [formData, setFormData] = useState({
    keyword: "",
    meaning: "",
    analogy: "",
    syntax: "",
    example_query: "",
    icon: "BookOpen",
    color: "from-blue-400 to-indigo-600",
    questions: "[]"
  })

  const fetching = async () => {
    setLoading(true)
    try {
      const response = await DictionaryGetAllApi(token)
      setEntries(response.data || [])
    } catch (e) {
      console.log("API Error:", e)
      toast.error("Failed to load dictionary entries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetching()
  }, [])

  const filteredData = entries.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.keyword.toLowerCase().includes(q) ||
      e.meaning.toLowerCase().includes(q)
    )
  })

  const handleSubmit = async () => {
    try {
      let questionsArr: any[] = []
      try {
        questionsArr = JSON.parse(formData.questions)
      } catch {
        toast.error("Questions must be valid JSON array")
        return
      }

      const payload = {
        ...formData,
        questions: questionsArr
      }

      if (isEdit && editId !== null) {
        await updateDictionaryByIdApi(editId, token, payload)
        toast.success("Entry updated successfully")
      } else {
        await addDictionaryApi(token, payload)
        toast.success("Entry added successfully")
      }

      await fetching()
      setShowModal(false)
      resetForm()
    } catch (e: any) {
      const msg = e.response?.data?.errors?.non_field_errors?.[0] ||
        e.response?.data?.message || "Something went wrong"
      toast.error(msg)
    }
  }

  const resetForm = () => {
    setFormData({
      keyword: "",
      meaning: "",
      analogy: "",
      syntax: "",
      example_query: "",
      icon: "BookOpen",
      color: "from-blue-400 to-indigo-600",
      questions: "[]"
    })
    setIsEdit(false)
    setEditId(null)
  }

  const handleEdit = (entry: DictionaryEntry) => {
    setFormData({
      keyword: entry.keyword,
      meaning: entry.meaning,
      analogy: entry.analogy || "",
      syntax: entry.syntax || "",
      example_query: entry.example_query || "",
      icon: entry.icon || "BookOpen",
      color: entry.color || "from-blue-400 to-indigo-600",
      questions: JSON.stringify(entry.questions || [], null, 2)
    })
    setEditId(entry.id)
    setIsEdit(true)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      if (deleteId !== null) {
        await deleteDictionaryByIdApi(deleteId, token)
        await fetching()
        toast.success("Deleted successfully")
        setShowDeleteModal(false)
      }
    } catch (e: any) {
      toast.error("Delete failed")
    }
  }

  const handleSelect = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(i => i !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await bulkDeleteDictionaryApi(selectedRows, token)
      toast.success(`${selectedRows.length} entry(ies) deleted!`)
      setSelectedRows([])
      setShowBulkDeleteModal(false)
      await fetching()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Bulk delete failed")
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await seedDictionaryApi(token)
      toast.success(res.message || "Seeded successfully!")
      await fetching()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Seed failed")
    } finally {
      setSeeding(false)
    }
  }

  const handleAiGenerate = async () => {
    setAiGenerating(true)
    try {
      const res = await generateAiDictionaryApi(token, aiCount)
      toast.success(res.message || "AI Generated successfully!")
      await fetching()
      setShowAiModal(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "AI Generation failed")
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
    { header: "Keyword", accessor: "keyword" },
    { header: "Meaning", accessor: "meaning" },
    { header: "Syntax", accessor: "syntax" },
    {
      header: "Questions",
      accessor: "questions",
      cell: (row: any) => (
        <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
          {Array.isArray(row.questions) ? row.questions.length : 0}
        </span>
      ),
    },
  ]

  const hasData = filteredData.length > 5

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      className="p-5 md:p-8 min-h-screen bg-transparent transition-colors duration-500"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen size={28} className="text-blue-500" />
            SQL Dictionary
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage all SQL dictionary entries — add, edit, or remove keywords.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-end">
          <button
            onClick={() => { setShowModal(true); setIsEdit(false); resetForm() }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold shrink-0 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold shrink-0 whitespace-nowrap"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">AI Generate</span>
          </button>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 font-semibold disabled:opacity-70 shrink-0 whitespace-nowrap"
          >
            {seeding ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span className="hidden sm:inline">{seeding ? "Seeding..." : "Seed from JSON"}</span>
          </button>
        </div>
      </motion.div>

      {/* Search Bar and Actions */}
      <motion.div variants={itemVariants} className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords or meanings..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        
        {/* Bulk Delete */}
        <AnimatePresence>
          {selectedRows.length > 0 && (
            <motion.button
              key="bulk-delete"
              initial={{ opacity: 0, scale: 0.85, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 text-sm font-semibold shrink-0 whitespace-nowrap"
            >
              <Trash2 size={16} />
              <span>Delete Selected ({selectedRows.length})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-500">
        <ReusableTable
          columns={columns}
          data={filteredData}
          pagination={true}
          hasData={hasData}
          isLoading={loading}
          height="350px"
          actions={(row: any) => (
            <div className="flex gap-2 justify-center">
              <button onClick={() => handleEdit(row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110 active:scale-95">
                <Pencil size={18} />
              </button>
              <button
                onClick={() => { setDeleteId(row.id); setShowDeleteModal(true) }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </motion.div>

      {/* Add / Edit Modal */}
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
              className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEdit ? "Edit Entry" : "Add New Entry"}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <X size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keyword *</label>
                    <input
                      type="text"
                      placeholder="e.g. SELECT"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meaning *</label>
                    <input
                      type="text"
                      placeholder="e.g. Choose or Take"
                      value={formData.meaning}
                      onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analogy</label>
                  <textarea
                    placeholder="Real-world analogy..."
                    value={formData.analogy}
                    onChange={(e) => setFormData({ ...formData, analogy: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[70px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Syntax</label>
                    <input
                      type="text"
                      placeholder="e.g. SELECT column FROM table;"
                      value={formData.syntax}
                      onChange={(e) => setFormData({ ...formData, syntax: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Example Query</label>
                    <input
                      type="text"
                      placeholder="e.g. SELECT name FROM Users;"
                      value={formData.example_query}
                      onChange={(e) => setFormData({ ...formData, example_query: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                    <input
                      type="text"
                      placeholder="e.g. BookOpen"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Gradient</label>
                    <input
                      type="text"
                      placeholder="e.g. from-blue-400 to-indigo-600"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Questions (JSON Array)</label>
                  <textarea
                    placeholder='[{"question":"...","options":["a","b","c","d"],"answer":"a"}]'
                    value={formData.questions}
                    onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] font-mono text-sm"
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
                  {isEdit ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Modal */}
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
              <h2 className="text-xl font-bold mb-2">Delete Entry</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this dictionary entry? This action cannot be undone.
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

      {/* Bulk Delete Modal */}
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
              <h2 className="text-xl font-bold mb-2">Delete Selected Entries</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-500">{selectedRows.length} entry(ies)</span>? This action cannot be undone.
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
        {showAiModal && (
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
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-xl font-bold">AI Generate</h2>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Use Gemini AI to automatically generate new, unique SQL dictionary keywords and questions.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Entries to Generate: <span className="font-bold text-purple-600 dark:text-purple-400">{aiCount}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={aiCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) setAiCount(val)
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAiModal(false)}
                  disabled={aiGenerating}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 shadow-md shadow-purple-600/20 transition-all font-medium flex-1 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {aiGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : "Generate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AdminSqlDictionary
