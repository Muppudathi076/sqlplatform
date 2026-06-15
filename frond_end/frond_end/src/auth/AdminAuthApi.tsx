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

// ═══════════════  SQL DICTIONARY ADMIN APIs  ═══════════════

export const DictionaryGetAllApi = async (token: string) => {
  const response = await axiosInstance.get("admins/dictionary/", {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const addDictionaryApi = async (token: string, data: Record<string, any>) => {
  const response = await axiosInstance.post("admins/dictionary/create/", data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateDictionaryByIdApi = async (entryId: number, token: string, data: Record<string, any>) => {
  const response = await axiosInstance.patch(`admins/dictionary/update/${entryId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const deleteDictionaryByIdApi = async (entryId: number, token: string) => {
  const response = await axiosInstance.delete(`admins/dictionary/delete/${entryId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const bulkDeleteDictionaryApi = async (ids: number[], token: string) => {
  const response = await axiosInstance.delete("admins/dictionary/bulk-delete/", {
    data: { ids },
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const seedDictionaryApi = async (token: string) => {
  const response = await axiosInstance.post("admins/dictionary/seed/", {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// ═══════════════  SQL ACADEMY ADMIN APIs  ═══════════════

export const AcademyGetAllApi = async (token: string) => {
  const response = await axiosInstance.get("admins/academy/", {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const addAcademyApi = async (token: string, data: Record<string, any>) => {
  const response = await axiosInstance.post("admins/academy/create/", data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateAcademyByIdApi = async (entryId: number, token: string, data: Record<string, any>) => {
  const response = await axiosInstance.patch(`admins/academy/update/${entryId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const deleteAcademyByIdApi = async (entryId: number, token: string) => {
  const response = await axiosInstance.delete(`admins/academy/delete/${entryId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const bulkDeleteAcademyApi = async (ids: number[], token: string) => {
  const response = await axiosInstance.delete("admins/academy/bulk-delete/", {
    data: { ids },
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const seedAcademyApi = async (token: string) => {
  const response = await axiosInstance.post("admins/academy/seed/", {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// ═══════════════  AI GENERATION APIs  ═══════════════

export const generateAiDictionaryApi = async (token: string, count: number) => {
  const response = await axiosInstance.post("admins/ai/generate/dictionary/", { count }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const generateAiAcademyApi = async (token: string, count: number) => {
  const response = await axiosInstance.post("admins/ai/generate/academy/", { count }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getAdminAiInsightsApi = async (token: string) => {
  const response = await axiosInstance.get("admins/ai/insights/", {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}