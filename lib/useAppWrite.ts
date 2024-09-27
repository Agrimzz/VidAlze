import { useState, useEffect } from "react"
import { Alert } from "react-native"
import { getAllPosts } from "./appwrite"

const useAppWrite = (fn: any) => {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response: any = await fn()
      setData(response)
    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const refetch = () => fetchData()

  return { data, refetch }
}

export default useAppWrite
