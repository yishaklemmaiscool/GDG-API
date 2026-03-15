import { useEffect, useState } from 'react'
import './App.css'

// TMDb (The Movie Database) popular movies endpoint
// NOTE: This key is from your request; in a real project you should keep API keys secret.
const MOVIES_API = 'https://api.themoviedb.org/3/movie/popular?api_key=2993d064f9608273325bbc41faec9f86'

function App() {
  const [movies, setMovies] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [view, setView] = useState('browse')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('watchlist')
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    setLoading(true)
    setError('')

    fetch(MOVIES_API)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // TMDb returns { results: [...] }
        const results = Array.isArray(data?.results) ? data.results : []
        setMovies(results.slice(0, 24))
      })
      .catch(() => setError('Unable to load movies. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const addToWatchlist = (movie) => {
    const key = movie.id ?? movie.imdbID ?? movie.title
    setWatchlist((prev) => {
      if (prev.some((m) => (m.id ?? m.imdbID ?? m.title) === key)) return prev
      return [...prev, movie]
    })
  }

  const removeFromWatchlist = (movie) => {
    const key = movie.id ?? movie.imdbID ?? movie.title
    setWatchlist((prev) => prev.filter((m) => (m.id ?? m.imdbID ?? m.title) !== key))
  }

  const isInWatchlist = (movie) => {
    const key = movie.id ?? movie.imdbID ?? movie.title
    return watchlist.some((m) => (m.id ?? m.imdbID ?? m.title) === key)
  }

  const filteredMovies = movies.filter((movie) => {
    if (!search.trim()) return true
    return movie.title?.toLowerCase().includes(search.trim().toLowerCase())
  })

  return (
    <main className="app">
      <header className="appHeader">
        <h1>Movie Watchlist</h1>
        <div className="viewToggle">
          <button
            type="button"
            className={view === 'browse' ? 'active' : ''}
            onClick={() => setView('browse')}
          >
            Browse
          </button>
          <button
            type="button"
            className={view === 'watchlist' ? 'active' : ''}
            onClick={() => setView('watchlist')}
          >
            Watchlist ({watchlist.length})
          </button>
        </div>
      </header>

      {view === 'browse' ? (
        <section className="movies">
          <div className="searchBar">
            <label htmlFor="movieSearch">Search by title</label>
            <input
              id="movieSearch"
              type="search"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <p className="status">Loading movies…</p>}
          {error && <p className="status error">{error}</p>}
          {!loading && !error && (
            <>
              {filteredMovies.length === 0 ? (
                <p className="status">No movies match your search.</p>
              ) : (
                <div className="movieGrid">
                  {filteredMovies.map((movie) => {
                    const movieKey = movie.id ?? movie.imdbID ?? movie.title
                    return (
                      <article key={movieKey} className="movieCard">
                        <div className="poster">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                              alt={movie.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="posterPlaceholder">No image</div>
                          )}
                        </div>
                        <div className="movieInfo">
                          <h3>{movie.title}</h3>
                          <p className="subtitle">{movie.release_date ?? ''}</p>
                          <button
                            type="button"
                            onClick={() => addToWatchlist(movie)}
                            disabled={isInWatchlist(movie)}
                          >
                            {isInWatchlist(movie) ? 'Added' : 'Add to watchlist'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <section className="watchlist">
          <div className="watchlistHeader">
            <h2>My Watchlist</h2>
            <button type="button" onClick={() => setWatchlist([])} disabled={watchlist.length === 0}>
              Clear watchlist
            </button>
          </div>
          {watchlist.length === 0 ? (
            <p className="status">No movies added yet. Go to Browse to add favorites.</p>
          ) : (
            <div className="movieGrid">
              {watchlist.map((movie) => {
                const movieKey = movie.id ?? movie.imdbID ?? movie.title
                return (
                  <article key={movieKey} className="movieCard">
                    <div className="poster">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="posterPlaceholder">No image</div>
                      )}
                    </div>
                    <div className="movieInfo">
                      <h3>{movie.title}</h3>
                      <p className="subtitle">{movie.release_date ?? ''}</p>
                      <button type="button" onClick={() => removeFromWatchlist(movie)}>
                        Remove
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
