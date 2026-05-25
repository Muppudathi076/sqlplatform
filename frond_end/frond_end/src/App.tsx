import { Route,Routes } from "react-router-dom"
import LandingPage from "./Page/LandingPage"
import Login from "./Page/Login"
import Register from "./Page/Register"
import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./utils/ProtectedRoute"
import DashboardLayout from "./layout/DashboardLayout"
import Dashboard from "./Page/Dashboard"
import Model from "./Page/Model"
import UserProfile from "./Page/UserProfile"
import ModelsPage from "./Page/ModelsPage"
import AdminDashboard from "./components/AdminComponents/Admindashboard"
import UserList from "./components/AdminComponents/UserList"
import QuestionPage from "./components/AdminComponents/QuestionPage"
import RankPage from "./components/AdminComponents/RankPage"
import FillInTheBlanksPage from "./components/QuestionModel/FillInTheBlanksPage"
import ChooseBestAnswer from "./components/QuestionModel/ChooseBestAnswer"
import ModelSuccessPage from "./components/QuestionModel/ModelSuccessPage"
import TrueFalsePage from "./components/QuestionModel/TrueFalsePage"
import DragAndDropPage from "./components/QuestionModel/DragAndDropPage"
import { QuestionCacheProvider } from "./context/QuestionCacheContext"
import SqlDictionary from "./Page/SqlDictionary"
import SqlAcademy from "./Page/SqlAcademy"

function App() {
  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/fling/blangs' element={<FillInTheBlanksPage/>}/>
      <Route path='/api' element={
        <ProtectedRoute>
          <QuestionCacheProvider>
            <DashboardLayout/>
          </QuestionCacheProvider>
        </ProtectedRoute>}>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='model' element={<ModelsPage/>}/>
          <Route path='dictionary' element={<SqlDictionary/>}/>
          <Route path='academy' element={<SqlAcademy/>}/>
          <Route path='modal/:id' element={<Model/>}/>
          <Route path='profile' element={<UserProfile/>}/>
          <Route path='admin/dashboard' element={<AdminDashboard/>}/>
          <Route path='admin/userlist' element={<UserList/>}/>
          <Route path='admin/modalpage' element={<QuestionPage/>}/>
          <Route path='admin/rank' element={<RankPage/>}/>
          <Route path='modal/fling/blangs' element={<FillInTheBlanksPage/>}/>
          <Route path='modal/choose/answer' element={<ChooseBestAnswer/>}/>
          <Route path='modal/true-false' element={<TrueFalsePage/>}/>
          <Route path='modal/drag-drop' element={<DragAndDropPage/>}/>
          <Route path='modal/success' element={<ModelSuccessPage/>}/>
      </Route>
    </Routes>
    </>
  )
}

export default App
