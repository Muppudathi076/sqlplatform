import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import ReusableTable from "../ReusableComponents/ReusableTable"
import { UserGetAllApi,UserdeleteByIdApi } from "../../auth/AdminAuthApi"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

type User = {
  name: string
  score: number
  model: string
  active: string
}

function UserList() {

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  })
  const handleAddUser = () => {
    setUsers([
      ...users,
      {
        name: newUser.name,
        score: 0,
        model: "Level 1",
        active: "Yes",
      },
    ])
    setShowAddModal(false)
    setNewUser({ name: "", email: "", password: "" })
  }

  const handleDeleteUser = async() => {
      try{
        if (!selectedUserId) return
        await UserdeleteByIdApi(selectedUserId,token)
        toast.success("Delete Successfully",{duration:2000})
        setUsers((prev: any[]) =>
          prev.filter(user => user.id !== selectedUserId)
        )
        setShowDeleteModal(false)
        setSelectedUserId(null)
      }catch (err) {
    console.error(err)
    toast.error("Some Went wrong",{duration:2000})
  }
    
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Score", accessor: "score" },
    { header: "Current Model", accessor: "model" },
    { header: "Time", accessor: "total_time" },
    { header: "Assessment Level", accessor: "assessment_level", cell: (row: any) => row.assessment_level ? row.assessment_level.charAt(0).toUpperCase() + row.assessment_level.slice(1) : "Pending" },
    { header: "Assessment Score", accessor: "assessment_score" },
  ]
  const token = localStorage.getItem("access_token") || ""
  const fetching_data = async()=>{
    setLoading(true)
    try{
        const res = await UserGetAllApi(token)
        setUsers(res.data)
        const userData = res?.data || []  
        setUsers(Array.isArray(userData) ? userData : [])
      }catch(e){
      toast.error("Something Went Wrong",{duration:2000})
    } finally {
      setLoading(false)
    }
  }

useEffect (()=>{
  fetching_data()
},[])

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
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your platform's users and their progress.</p>
        </div>

        {/* <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <UserPlus size={18} />
          <span>Add User</span>
        </button> */}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-500">
        <ReusableTable columns={columns} data={users} height="350px" pagination={true} isLoading={loading}
        actions={(row: any) => (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedUserId(row.id)
              setShowDeleteModal(true)
            }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        )}/>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New User</h2>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all font-medium"
                >
                  Add User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
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
              <h2 className="text-xl font-bold mb-2">Delete User</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex-1"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    handleDeleteUser()
                  }}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-600/20 transition-all font-medium flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

export default UserList