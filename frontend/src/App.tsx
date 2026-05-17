import { useState } from 'react'
import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const awsUrl = 'https://uh8qjzjp1f.execute-api.us-east-1.amazonaws.com/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${awsUrl}shorten`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ longUrl: inputValue })
        }
      )
      const data = await response.json()
      console.log('API response:', data)
      setShortUrl(
        `${awsUrl}${data.shortCode}`
      )
    } catch (err) {
    console.log('Error caught:', err)
    setError('Something went wrong. Please try again.')
} finally {
      setLoading(false)
    }
  }
  console.log('shortUrl state:', shortUrl)
  console.log('Submitting longUrl:', inputValue)
  return (
    <section id="center">
      <h1>Get started. Right now</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-500">
          <input
            type="text"
            style={{ width: '500px' }}
            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
            placeholder="Paste your long URL here"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !inputValue}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-4 disabled:opacity-50">
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {shortUrl && (
          <div className="mt-4">
              <a href={shortUrl} target="_blank" rel="noreferrer" 
                  className="text-blue-400 underline">
                  {shortUrl}
              </a>
          </div>
      )}

      {error && <p className="text-red-400 mt-2">{error}</p>}
    </section>
  )
}

export default App