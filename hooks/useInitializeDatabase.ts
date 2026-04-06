import { useEffect, useState } from "react"

export function useInitializeDatabase() {
  const [initialized, setInitialized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAndInitialize = async () => {
      try {
        setChecking(true)

        // Check if database is initialized
        const testResponse = await fetch("/api/test-db")
        const testData = await testResponse.json()

        const allTablesExist = testData.checks?.every((check: any) => check.exists)

        if (!allTablesExist) {
          // Initialize database
          const initResponse = await fetch("/api/init-db", {
            method: "POST",
          })

          const initData = await initResponse.json()

          if (!initData.success) {
            setError(initData.error || "Failed to initialize database")
            setInitialized(false)
            setChecking(false)
            return
          }

          // Wait a bit and test again
          await new Promise((resolve) => setTimeout(resolve, 2000))

          const retestResponse = await fetch("/api/test-db")
          const retestData = await retestResponse.json()

          if (retestData.checks?.every((check: any) => check.exists)) {
            setInitialized(true)
            setError(null)
          } else {
            setError("Database initialization completed but tables not verified")
            setInitialized(false)
          }
        } else {
          setInitialized(true)
          setError(null)
        }
      } catch (err) {
        setError(String(err))
        setInitialized(false)
      } finally {
        setChecking(false)
      }
    }

    checkAndInitialize()
  }, [])

  return { initialized, checking, error }
}
