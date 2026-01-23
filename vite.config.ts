import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  define: {
    // According to Vite's documentation, the value of a 'define' entry
    // should be a string literal. We use JSON.stringify to convert
    // the object into a string. Vite will then perform a direct
    // replacement of `process.env` in the code with this object,
    // making the API key available in the browser.
    'process.env': JSON.stringify({
      API_KEY: process.env.API_KEY
    })
  }
})
