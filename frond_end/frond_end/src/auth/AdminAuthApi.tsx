import axiosInstance from "./axiosInstance"

export const UserGetAllApi = async(token:string)=>{
    const response = await axiosInstance.get(`/admins/user/list/`,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const QuestionGetAllApi = async(token:string)=>{
    const response = await axiosInstance.get(`/admins/models/`,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const UserdeleteByIdApi = async(userId:Number,token:string)=>{
    const response = await axiosInstance.delete(`admins/delete/userbyid/${userId}`,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const addQuestionApi = async (
  token: string,
  newData: Record<string, any>
) => {
  const response = await axiosInstance.post(
    `admins/question/create/`,
    newData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}

export const questionUpdatedByIdApi = async(usquestionIderId:Number,token:string,updatedData:Record<string, any>)=>{
    const response = await axiosInstance.patch(`admins/question/update/${usquestionIderId}`,updatedData,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const questiondeleteByIdApi = async(userId:Number,token:string)=>{
    const response = await axiosInstance.delete(`admins/question/delete/${userId}`,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const bulkImportQuestionsApi = async (questions: Record<string, any>[], token: string) => {
  const response = await axiosInstance.post(
    "admins/question/bulk-import/",
    { questions },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

export const bulkDeleteQuestionsApi = async (ids: number[], token: string) => {
  const response = await axiosInstance.delete(
    "admins/question/bulk-delete/",
    {
      data: { ids },
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  return response.data
}

export const aiBulkGenerateQuestionsApi = async (difficulty: string, count: number, token: string) => {
  const response = await axiosInstance.post(
    "admins/ai/bulk-generate/",
    { difficulty, count },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}