import { useState, useEffect } from "react"
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import { logoutApi, UserGetApi, updateProfileApi, userdashboardApi } from "../auth/authapi"
import { Sun, Moon, LayoutDashboard, Boxes, Users, LogOut, Menu, X, Trophy, Shield, Mail, Loader2, Star, Clock, Activity, Pencil, User, Calendar, Lock, Check, BookOpen, Rocket } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark"
  })

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<"personal" | "rank">("personal")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", age: "" })
  const [saving, setSaving] = useState(false)

  const role = localStorage.getItem("role") || ""
  const userName = localStorage.getItem("user") || ""

  const isQuestionPage = location.pathname.includes("/api/modal/") || location.pathname.includes("/admin/modalpage/");

  const handleLogout = async() => {
    const token = localStorage.getItem("access_token") || ""
    try{
      await logoutApi(token)
      localStorage.removeItem("access_token")
    }catch(e:any){
      console.log("logout api :",e)
    }
    navigate("/")
    toast.success("Logout successfully", { duration: 2000 })
    localStorage.removeItem("access_token")
  }

  const openProfile = async () => {
    setShowProfileModal(true)
    setLoadingProfile(true)
    try {
      const token = localStorage.getItem("access_token") || ""
      const res = await UserGetApi(token)
      const dash = await userdashboardApi(token)
      setProfileData({ ...res, dashboard: dash?.cards })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProfile(false)
    }
  }

  const openEditModal = () => {
    setEditForm({
      name: profileData?.Name || "",
      email: profileData?.Email || "",
      password: "",
      age: profileData?.age ? String(profileData.age) : "",
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("access_token") || ""
      const payload: any = {}
      if (editForm.name) payload.name = editForm.name
      if (editForm.email) payload.email = editForm.email
      if (editForm.password) payload.password = editForm.password
      if (editForm.age) payload.age = Number(editForm.age)
      await updateProfileApi(payload, token)
      // refresh profile data
      const res = await UserGetApi(token)
      setProfileData(res)
      if (editForm.name) localStorage.setItem("user", editForm.name)
      toast.success("Profile updated!", { duration: 2000 })
      setShowEditModal(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed", { duration: 2000 })
    } finally {
      setSaving(false)
    }
  }

  const toggleDarkMode = (event?: React.MouseEvent) => {
    const doc = document as any;
    const isAppearanceTransition =
      doc.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition || !event) {
      setDarkMode(prev => !prev);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      setDarkMode(prev => !prev);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  const adminMenu = [
    { name: "Dashboard", path: "admin/dashboard", icon: LayoutDashboard },
    { name: "User List", path: "admin/userlist", icon: Users },
    { name: "Models", path: "admin/modalpage", icon: Boxes },
    { name: "Rank", path: "admin/rank", icon: Trophy },
  ]
  const userMenu = [
    { name: "Dashboard", path: "/api/dashboard", icon: LayoutDashboard },
    { name: "SQL Dictionary", path: "/api/dictionary", icon: BookOpen },
    { name: "SQL Academy", path: "/api/academy", icon: Rocket },
    { name: "Models", path: "/api/model", icon: Boxes }
  ]

  const menuItems = role === "admin" ? adminMenu : userMenu

  return (
    <div className="h-screen bg-slate-50 dark:bg-black transition-colors duration-500 flex overflow-hidden text-slate-900 dark:text-white relative">
      
      {(role === "user" || role === "admin") && !isQuestionPage && (
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border-r border-slate-200 dark:border-zinc-800 h-full relative z-50 animate-in fade-in slide-in-from-left duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Tiny Todds
            </h1>
          </div>

          <div className="flex-1 px-4 space-y-2 py-4">
            <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Main Menu
            </p>
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-blue-500"}`
                }
              >
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.name}</span>
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full scale-y-0 group-[.active]:scale-y-100 transition-transform duration-300" />
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-4">
            <button 
              onClick={openProfile}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-blue-500/10 border border-slate-200 dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/30 rounded-2xl text-left transition-all group shadow-sm"
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-1">Account</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-sm text-black dark:text-white truncate group-hover:text-blue-500 transition-colors">{userName}</p>
              </div>
            </button>
            
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 w-full px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all duration-300 font-bold shadow-sm"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {(role === "user" || role === "admin") && !isQuestionPage && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/5 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
           <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Tiny Todds
            </h1>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[55] bg-white dark:bg-black pt-20 px-6 space-y-4">
           {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-4 rounded-2xl
                  ${isActive ? "bg-blue-500 text-white shadow-lg" : "text-gray-600 dark:text-gray-300"}`
                }
              >
                <item.icon size={22} />
                <span className="text-lg font-medium">{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowLogoutModal(true)
              }}
              className="flex items-center gap-4 p-4 w-full text-red-500"
            >
              <LogOut size={22} />
              <span className="text-lg font-medium">Logout</span>
            </button>
        </div>
      )}

      <main className={`flex-1 flex flex-col min-w-0 h-full relative ${isQuestionPage ? 'pt-0' : 'pt-16 lg:pt-0'}`}>
        <div className="flex-1 overflow-auto bg-transparent relative z-10">
          <Outlet />
        </div>
      </main>

      <button
        onClick={toggleDarkMode}
        className={`fixed ${isQuestionPage ? 'bottom-32' : 'bottom-6'} right-6 z-[70] w-14 h-14 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all duration-500 flex items-center justify-center ${
          darkMode
            ? "bg-gradient-to-r from-indigo-600 to-blue-700 shadow-[0_4px_20px_rgba(99,102,241,0.5)]"
            : "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.5)]"
        }`}
      >
        <div className={`transition-transform duration-500 ${darkMode ? "rotate-[360deg]" : "rotate-0"}`}>
          {darkMode ? <Moon size={24} className="text-white" /> : <Sun size={24} className="text-white" />}
        </div>
      </button>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]">
          <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white p-8 rounded-3xl w-[90%] max-w-sm shadow-2xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-2">Ready to leave?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">We'll save your progress for next time!</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  handleLogout()
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100]">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
               onClick={() => setShowProfileModal(false)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: -20 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden border border-slate-200 dark:border-gray-700 z-10 m-4"
             >
               {/* Decorative bg element */}
               <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-500 to-purple-500" />
               
               <button 
                 onClick={() => setShowProfileModal(false)}
                 className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
               >
                 <X size={20} className="text-gray-500 dark:text-gray-400" />
               </button>

               <div className="flex flex-col items-center relative z-10">
                 <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring", delay: 0.1 }}
                   className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-black text-white shadow-xl mb-4"
                 >
                   {userName?.charAt(0).toUpperCase()}
                 </motion.div>
                 
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">{userName}</h2>
                 
                 <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                   <Shield size={12} />
                   <span>{role}</span>
                 </div>

                 {/* TABS */}
                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-full mb-4">
                   <button 
                     onClick={() => setActiveTab("personal")}
                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === "personal" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                   >
                     Personal
                   </button>
                   <button 
                     onClick={() => setActiveTab("rank")}
                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === "rank" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                   >
                     Rank Info
                   </button>
                 </div>

                  {activeTab === "personal" && (
                    <div className="w-full flex justify-end mb-2">
                      <button
                        onClick={openEditModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-700/40"
                      >
                        <Pencil size={12} /> Edit Profile
                      </button>
                    </div>
                  )}

                  {loadingProfile ? (
                   <div className="flex items-center justify-center gap-2 text-gray-500 py-8 w-full">
                     <Loader2 size={20} className="animate-spin" />
                     <span className="text-sm font-medium">Loading details...</span>
                   </div>
                 ) : (
                   <div className="w-full" style={{ minHeight: "310px" }}>
                     <AnimatePresence mode="wait">
                       {activeTab === "personal" ? (
                         <motion.div 
                           key="personal"
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: 20 }}
                           transition={{ duration: 0.2 }}
                           className="w-full space-y-3"
                         >
                           <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-700/50 shadow-sm">
                             <div className="flex items-center gap-2 mb-1.5">
                               <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm"><User size={13} className="text-purple-500" /></div>
                               <span className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider">Name</span>
                             </div>
                             <p className="text-xl font-black text-gray-900 dark:text-white pl-1">{profileData?.Name || "—"}</p>
                           </div>
                           <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-transparent dark:border-gray-600/30">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Mail size={16} className="text-gray-400" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Email</span>
                             </div>
                             <span className="text-xs font-medium text-gray-500 truncate max-w-[130px]">{profileData?.Email || "Not available"}</span>
                           </div>
                           {/* Age */}
                           <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-transparent dark:border-gray-600/30">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><User size={16} className="text-orange-400" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Age</span>
                             </div>
                             <span className="text-xs font-medium text-gray-500">{profileData?.age ?? "—"}</span>
                           </div>
                           {/* Joined */}
                           <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-transparent dark:border-gray-600/30">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Calendar size={16} className="text-green-500" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Joined</span>
                             </div>
                             <span className="text-xs font-medium text-gray-500">
                               {profileData?.date_joined ? new Date(profileData.date_joined).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                             </span>
                           </div>
                         </motion.div>
                       ) : (
                         <motion.div 
                           key="rank"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           transition={{ duration: 0.2 }}
                           className="w-full space-y-3"
                         >
                           {/* Total Score */}
                           <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-amber-100 dark:border-amber-500/20">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Star size={16} className="text-amber-500" fill="currentColor" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Total Score</span>
                             </div>
                             <span className="text-sm text-amber-600 dark:text-amber-400 font-black">{profileData?.dashboard?.total_score || "0"}%</span>
                           </div>

                           {/* Global Rank */}
                           <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-blue-100 dark:border-blue-500/20">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Trophy size={16} className="text-blue-500" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Global Rank</span>
                             </div>
                             <span className="text-sm text-blue-600 dark:text-blue-400 font-bold">#{profileData?.dashboard?.global_rank || "—"}</span>
                           </div>

                           {/* Play Time */}
                           <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-purple-100 dark:border-purple-500/20">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Clock size={16} className="text-purple-500" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Play Time</span>
                             </div>
                             <span className="text-sm text-purple-600 dark:text-purple-400 font-bold">{profileData?.dashboard?.total_time || "0m"}</span>
                           </div>

                           {/* Status */}
                           <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-transparent dark:border-gray-600/30">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Activity size={16} className="text-green-500" /></div>
                               <span className="text-sm font-bold text-gray-900 dark:text-white">Status</span>
                             </div>
                             <span className="text-[10px] px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full font-black uppercase tracking-wider">
                               {profileData?.active !== false && profileData?.active !== "Inactive" ? "Active" : "Inactive"}
                             </span>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 )}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-7 max-w-sm w-full shadow-2xl relative z-10 m-4 border border-gray-100 dark:border-gray-700"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-500 to-purple-500 pointer-events-none" />
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Edit Profile</h3>
              <p className="text-xs text-gray-400 mb-6">Update your personal details below</p>

              <div className="space-y-3">
                {/* Name */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-2xl border border-transparent dark:border-gray-600/30">
                  <User size={16} className="text-purple-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none placeholder-gray-400"
                  />
                </div>
                {/* Email */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-2xl border border-transparent dark:border-gray-600/30">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none placeholder-gray-400"
                  />
                </div>
                {/* Age */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-2xl border border-transparent dark:border-gray-600/30">
                  <Calendar size={16} className="text-green-500 flex-shrink-0" />
                  <input
                    type="number"
                    placeholder="Age"
                    value={editForm.age}
                    onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none placeholder-gray-400"
                  />
                </div>
                {/* Password */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-2xl border border-transparent dark:border-gray-600/30">
                  <Lock size={16} className="text-red-400 flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="New Password (leave blank to keep)"
                    value={editForm.password}
                    onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30 disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default DashboardLayout