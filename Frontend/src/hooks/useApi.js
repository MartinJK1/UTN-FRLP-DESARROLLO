import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Hook para realizar queries a la API
export const useApiQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options
  })
}

// Hook para realizar mutaciones a la API
export const useApiMutation = (mutationFn, invalidateQueriesKey, options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalida y refetch la query para actualizar los datos
      if (invalidateQueriesKey) {
        queryClient.invalidateQueries(invalidateQueriesKey)
      }
      // Llama al onSuccess original si existe
      if (options.onSuccess) {
        options.onSuccess(data, variables, context)
      }
    },
    ...options
  })
}
