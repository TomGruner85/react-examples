import { useCallback, useState } from "react";

const useFetch = (requestFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = useCallback(
    async (requestData) => {
      setLoading(true)
      setError(null)
      try{
        const responseData = await requestFunction(requestData)
        setLoading(false)
        setData(responseData)
      } catch (error) {
        setLoading(false)
        setError(error)
      }
    }
    ,[requestFunction])

  return {
    data,
    loading,
    error,
    sendRequest
  };
};

export default useFetch;
