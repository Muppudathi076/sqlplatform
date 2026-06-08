import { useNavigate } from "react-router-dom"

type Props = {
  title: string
  message: string
  buttonText?: string
  redirectPath: string
  icon?: React.ReactNode
}

export default function StatusPage({
  title,
  message,
  buttonText = "Go Back",
  redirectPath,
  icon
}: Props) {

  const navigate = useNavigate()
  console.log("enter the stateg page")
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center">

        <div className="flex justify-center mb-6">
          {icon}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {title}
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          {message}
        </p>

        <button
          onClick={() => navigate(redirectPath)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-200"
        >
          {buttonText}
        </button>

      </div>
    </div>
  )
}