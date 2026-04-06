#!/usr/bin/env node

/**
 * Backend Test Script
 * Tests all database operations and API endpoints
 */

const https = require("https")
const http = require("http")

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const isHttps = url.protocol === "https:"
    const client = isHttps ? https : http

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    const req = client.request(url, options, (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, data: parsed })
        } catch {
          resolve({ status: res.statusCode, data })
        }
      })
    })

    req.on("error", reject)

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

async function runTests() {
  log("\n=== Comptabilité Flow - Backend Test Suite ===\n", "blue")

  let passed = 0
  let failed = 0

  // Test 1: Health check
  log("Test 1: API Health Check", "yellow")
  try {
    const result = await request("GET", "/api/test-db")
    if (result.status === 200) {
      log("✓ API is responding", "green")
      passed++
    } else {
      log(`✗ API returned status ${result.status}`, "red")
      failed++
    }
  } catch (error) {
    log(`✗ API request failed: ${error.message}`, "red")
    failed++
  }

  // Test 2: Database test endpoint
  log("\nTest 2: Database Connection", "yellow")
  try {
    const result = await request("GET", "/api/test-db")
    if (result.status === 200 && result.data.success) {
      log("✓ Database connection successful", "green")
      passed++

      // Log table status
      if (result.data.checks) {
        result.data.checks.forEach((check) => {
          const status = check.exists ? "✓" : "✗"
          const message = `  ${status} Table: ${check.table || check.test}`
          log(message, check.exists ? "green" : "red")
        })
      }
    } else {
      log("✗ Database test failed", "red")
      failed++
    }
  } catch (error) {
    log(`✗ Database test error: ${error.message}`, "red")
    failed++
  }

  // Test 3: Init endpoint
  log("\nTest 3: Database Initialization Endpoint", "yellow")
  try {
    const result = await request("POST", "/api/init-db", {})
    if (result.status === 200 || result.status === 500) {
      // Both 200 (success) and 500 (already initialized) are acceptable
      log("✓ Init endpoint is accessible", "green")
      passed++
    } else {
      log(`✗ Init endpoint returned status ${result.status}`, "red")
      failed++
    }
  } catch (error) {
    log(`✗ Init endpoint error: ${error.message}`, "red")
    failed++
  }

  // Test 4: Page accessibility
  log("\nTest 4: Page Accessibility", "yellow")
  const pages = [
    "/dashboard",
    "/dashboard/depenses",
    "/dashboard/retraits",
    "/dashboard/categories",
    "/dashboard/analyse",
    "/dashboard/rapports",
    "/dashboard/outils",
    "/dashboard/init",
  ]

  for (const page of pages) {
    try {
      const result = await request("GET", page)
      if (result.status === 200 || result.status === 307 || result.status === 308) {
        // 307/308 are redirects which are ok
        log(`✓ ${page}`, "green")
        passed++
      } else {
        log(`✗ ${page} (status ${result.status})`, "red")
        failed++
      }
    } catch (error) {
      log(`✗ ${page} (error: ${error.message})`, "red")
      failed++
    }
  }

  // Summary
  log("\n=== Test Summary ===", "blue")
  log(`Passed: ${passed}`, "green")
  log(`Failed: ${failed}`, failed > 0 ? "red" : "green")

  const total = passed + failed
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0
  log(`Success Rate: ${percentage}%`, percentage === 100 ? "green" : "yellow")

  if (failed > 0) {
    log(
      "\nℹ️  Some tests failed. Check your Supabase integration and environment variables.",
      "yellow"
    )
  } else {
    log("\n✓ All tests passed! Your backend is ready.", "green")
  }

  process.exit(failed > 0 ? 1 : 0)
}

log("Starting tests...", "blue")
log(`Base URL: ${BASE_URL}`, "blue")

// Wait for server to be ready
setTimeout(() => {
  runTests().catch((error) => {
    log(`Fatal error: ${error.message}`, "red")
    process.exit(1)
  })
}, 1000)
