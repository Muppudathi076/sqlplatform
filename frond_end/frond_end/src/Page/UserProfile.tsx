import { useState,useEffect } from "react"
import { Pencil, User } from "lucide-react"
import { UpdatedPasswordApi, UserGetApi } from "../auth/authapi"
import toast from "react-hot-toast"

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    Email: "",
    Name: "",
    password: ""
  })
  const token = localStorage.getItem("access_token") || null
  const [loading, setLoading] = useState(false)

  const fetchdata = async () => {
    setLoading(true)
    if (!token) {
    toast.error("User not logged in")
    return
    }
    try{
      const response = await UserGetApi(token)
       console.log("user response:",response )
        setFormData({
        Email: response.Email,
        Name: response.Name,   
        password: ""
        })
      setLoading(false)
    }catch(e){
      toast.error("Something went wrong")
      setLoading(false)
    }
  }
    const handleChange = (e:any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async(e:any) => {
    e.preventDefault()
    console.log("updated api ",formData.Email, formData.password)
    if (!token) {
        toast.error("User not logged in")
        return
        }
    try {
      await UpdatedPasswordApi(formData.Email, formData.password,token)
      setIsOpen(false)
      fetchdata()
      toast.success("Password updated successfully", {
      duration: 2000   
    })
    } catch (error) {
          toast.error("Something went wrong", {
      duration: 2000
    })
    }
    
  }
useEffect(()=>{
  fetchdata()
},[])
  return (
<div className="min-h-screen flex items-start justify-center mt-0 bg-gray-100 dark:bg-gray-900 p-5">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
  <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">

    <div className="flex justify-end rounded transition-all duration-200">
      <button className="text-black bg-white dark:bg-gray-900 dark:text-gray-200" onClick={() => setIsOpen(true)}>
        <Pencil size={20} />
      </button>
    </div>

    <div className="flex justify-center mb-5">
      <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg hover:shadow-blue-400 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <User size={48} className="text-gray-400 dark:text-gray-500" />
      </div>
    </div>

    <h2 className="text-2xl font-bold text-center mb-4 text-black dark:text-white">
      User Profile
    </h2>

    <div className="mb-3">
      <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
        Name
      </label>
      <input
        type="text"
        name="name"
        value={formData?.Name}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-6">
      <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
        Email
      </label>
      <input
        type="email"
        name="email"
        value={formData?.Email}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

  </div>)}

  {isOpen && (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-96 border border-gray-200 dark:border-gray-700">

        <h3 className="text-lg font-bold mb-4 text-black dark:text-white">
          Edit Profile
        </h3>

        <input
          type="text"
          name="Name"
          value={formData?.Name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded"
        />

        <input
          type="email"
          name="Email"
          value={formData?.Email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded"
        />

        <input
          type="password"
          name="password"
          value={formData?.password}
          onChange={handleChange}
          placeholder="New Password"
          className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )}

</div>
  )
}

export default UserProfile