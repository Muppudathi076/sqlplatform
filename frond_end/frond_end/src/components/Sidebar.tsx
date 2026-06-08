import { useState } from "react"
import { NavLink } from "react-router-dom"
import { User, LogOut, GraduationCap, Code, BookOpen, Rocket } from "lucide-react"
import { Menu, X } from "lucide-react"
import { RxDashboard } from "react-icons/rx"

interface sidebar {
  isOpen: boolean,
  openLogout: () => void
  darkMode: boolean,
  toggleTheme: () => void
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
}

interface MenuItem {
  name: string
  path?: string
  icon: React.ReactNode;
  children?: { name: string; path: string }[]
}

function Sidebar({ isOpen, openLogout, isCollapsed, setIsCollapsed }: sidebar) {
  const role = localStorage.getItem("role")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  const adminMenu = [
    { name: "Dashboard", path: "/api/admin/dashboard", icon: <RxDashboard size={20} /> },
    { name: "Student Management", path: "/api/admin/userlist", icon: <GraduationCap size={20} /> },
    { name: "SQL Questions", path: "/api/admin/modalpage", icon: <BookOpen size={20} /> },
    { name: "SQL Dictionary", path: "/api/admin/dictionary", icon: <BookOpen size={20} /> },
    { name: "SQL Academy", path: "/api/admin/academy", icon: <GraduationCap size={20} /> },
  ]

  const userMenu = [
    { name: "Dashboard", path: "/api/dashboard", icon: <RxDashboard size={20} /> },
    { name: "SQL Dictionary", path: "/api/dictionary", icon: <BookOpen size={20} /> },
    { name: "SQL Academy", path: "/api/academy", icon: <Rocket size={20} /> },
    {
      name: "Models",
      icon: <Code size={20} />,
      children: [
        { name: "Level 1", path: "/api/model/1" },
        { name: "Level 2", path: "/api/model/2" },
      ]
    },
  ]

  let menuItems: MenuItem[] = []

  if (role === "admin") {
    menuItems = adminMenu
  } else if (role === "user") {
    menuItems = userMenu
  }

  return (
    <div
      className={`
    h-screen bg-white text-black dark:bg-black dark:text-white p-5
    fixed top-0 left-0 z-50 flex flex-col justify-between
    transition-all duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    ${isCollapsed ? "w-20" : "w-60"}
    md:translate-x-0
  `}
    >
      <div>
        <div
          className={`flex mb-3 ${isCollapsed
              ? "flex-col items-center"
              : "flex-row items-center justify-between"
            }`}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-blue-500 text-white rounded-md
    transition-all duration-200 hover:scale-110"
          >
            <Menu size={20} />
          </button>

          {!isCollapsed && (
            <p className="text-xl font-bold">Tiny Todds</p>
          )}

          <button
            onClick={() => isOpen}
            className="md:hidden p-2 rounded-md bg-white hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={10} />
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>

              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? "flex-col items-center justify-center" : "items-center gap-2"} p-2 rounded
   transition-all duration-200
   hover:bg-blue-500 hover:text-white hover:scale-105
   ${isActive ? "bg-blue-500 text-white" : "text-black dark:text-white"}`
                  }
                >
                  {item.icon}
                  {!isCollapsed && <span
                    className={`
                transition-all duration-300 ease-in-out
                ${isCollapsed ? "opacity-0 scale-0 h-0 overflow-hidden" : "opacity-100 scale-100"}
              `}
                  >
                    {item.name}
                  </span>}
                </NavLink>
              ) : (
                <div
                  onClick={() => toggleDropdown(index)}
                  className="flex items-center justify-between p-2 cursor-pointer rounded
              transition-all duration-200
              hover:bg-blue-500 hover:text-white hover:scale-105"
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <span>{openIndex === index ? "▲" : "▼"}</span>
                  )}
                </div>
              )}

              {item.children && openIndex === index && (
                <div className="ml-6 mt-1  max-h-40">
                  {item.children.map((child, i) => (
                    <NavLink
                      key={i}
                      to={child.path}
                      className={({ isActive }) =>
                        `block p-2 text-sm rounded transition-all duration-200
                    hover:bg-blue-500 hover:text-white hover:scale-105
                    ${isActive ? "bg-blue-500 text-white" : "text-black dark:text-white"}`
                      }
                    >
                      {!isCollapsed && child.name}
                    </NavLink>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">

        <NavLink
          to="/api/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded transition-all duration-200
      hover:bg-blue-500 hover:text-white hover:scale-105
      ${isActive ? "bg-blue-500 text-white" : "text-black dark:text-white"}`
          }
        >
          <User size={20} />
          {!isCollapsed && <span>Profile</span>}
        </NavLink>

        <div className="flex justify-between items-center">

          <button
            onClick={openLogout}
            className="flex items-center gap-3 p-2 rounded 
        bg-white text-black 
        dark:bg-black shadow shadow-blue-500 dark:text-white
        transition-all duration-200
         hover:scale-105"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>

        </div>
      </div>
    </div>
  )
}

export default Sidebar