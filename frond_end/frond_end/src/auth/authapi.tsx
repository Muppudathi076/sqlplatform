import axiosInstance from "./axiosInstance"

export const loginApi = async (Email: string, Password: string) => {
  const response = await axiosInstance.post("/login/", {
    Email,
    Password,
  })

  return response.data
}

export const logoutApi = async (token: string) => {
  const response = await axiosInstance.post("/logout/", {},       
    {headers:{
            Authorization:`Bearer ${token}`
        } } )

  return response.data
}

export const registerApi = async (Name:string,Email: string, Password: string) => {
  const response = await axiosInstance.post("/register/", {
    Name,
    Email,
    Password,
  })

  return response.data
}

export const UpdatedPasswordApi = async(email:string,new_password:string,token:string)=>{
    console.log("enter the api session")
    const response = await axiosInstance.put("/change/password/",{
        email,new_password
    },        
    {headers:{
            Authorization:`Bearer ${token}`
        } } )
     return response.data
}

export const UserGetApi = async(token:string)=>{
    const response = await axiosInstance.get(`/user/details/`,
        {headers:{
            Authorization:`Bearer ${token}`
        } }
    )
    return response.data
}

export const questionapiApi = async (id:number,token:string) => {
  const response = await axiosInstance.get(`/questions/${id}/`, {
        headers:{
            Authorization:`Bearer ${token}`
        }   
    })
  return response.data
}

export const valuesCheckingApi = async (id:number,query:string,token:string) => {
  const response = await axiosInstance.post(`/value/checking/${id}`,{query}, {
        headers:{
            Authorization:`Bearer ${token}`
        }   
    })
  return response.data
}

export const userdashboardApi = async (token:string) => {
  const response = await axiosInstance.get("user/dashboard/", {
        headers:{
            Authorization:`Bearer ${token}`
        }   
    })
  return response.data
}

export const submitModelResultsApi = async (modelId: number, results: any[], token: string) => {
  const response = await axiosInstance.post(`/model/complete/${modelId}/`, { results }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

export const singleQuestionProgressApi = async (questionId: number,isCorrect: boolean,token: string) => {
  const response = await axiosInstance.post(`/model/question-progress/`,
    {
      questionId,
      isCorrect,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateProfileApi = async (
  data: { name?: string; email?: string; password?: string; age?: number },
  token: string
) => {
  const response = await axiosInstance.put("/user/update/profile/", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

export const getSqlDictionaryApi = async (token: string) => {
  const response = await axiosInstance.get("/sql-dictionary/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

export const getSqlAcademyApi = async (token: string) => {
  const response = await axiosInstance.get("/sql-academy/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

export const updateSqlAcademyApi = async (level: number, token: string) => {
  const response = await axiosInstance.post("/update-sql-academy/", { level }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}