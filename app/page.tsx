'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const categories = ['All', 'Work', 'Shopping', 'Learning', 'Social', 'General']

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)

  // ---------------- AUTH ----------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ---------------- REALTIME ----------------
  useEffect(() => {
    if (session) {
      fetchBookmarks()

      const channel = supabase
        .channel('realtime-bookmarks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${session.user.id}`,
          },
          fetchBookmarks
        )
        .subscribe()

      return () =>{ 
        supabase.removeChannel(channel)
      }
    }
  }, [session])

  async function fetchBookmarks() {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  // ---------------- ADD ----------------
  async function addBookmark() {
    if (!url || !title) return

    let formattedUrl = url
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = 'https://' + formattedUrl
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        url: formattedUrl,
        title,
        category,
        user_id: session.user.id,
      })
      .select()

    if (error) return

    if (data) {
      setBookmarks((prev) => [data[0], ...prev])
    }

    setUrl('')
    setTitle('')
    setCategory('General')
  }

  // ---------------- DELETE ----------------
  async function deleteBookmark(id: string) {
    setBookmarks((prev) => prev.filter((bm) => bm.id !== id))
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  // ---------------- FILTER ----------------
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bm) => {
      const matchesSearch =
        bm.title.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        activeCategory === 'All' || bm.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [bookmarks, search, activeCategory])

  if (!session) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Your Bookmarks</h2>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search bookmarks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 bg-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-primary to-accent'
                : 'bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ADD FORM */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-white/10 p-3 rounded-xl"
        />

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="bg-white/10 p-3 rounded-xl"
        />

        {/* CUSTOM DARK DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="w-full bg-white/10 p-3 rounded-xl text-left text-white border border-white/10 flex justify-between items-center"
          >
            <span>{category}</span>
            <span
              className={`transition-transform ${
                showCategoryMenu ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {showCategoryMenu && (
            <div className="absolute z-50 mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
              {categories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      setShowCategoryMenu(false)
                    }}
                    className="p-3 text-white hover:bg-white/10 cursor-pointer transition"
                  >
                    {cat}
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          onClick={addBookmark}
          className="bg-gradient-to-r from-primary to-accent rounded-xl font-semibold"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {filteredBookmarks.map((bm) => (
          <motion.div
            key={bm.id}
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center bg-white/10 p-4 rounded-xl"
          >
            <div>
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent"
              >
                {bm.title}
              </a>
              <p className="text-xs text-gray-400">{bm.category}</p>
            </div>

            <button
              onClick={() => deleteBookmark(bm.id)}
              className="text-red-400"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
