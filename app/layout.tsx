
import './globals.css'

export const metadata = { title: 'Smart Bookmark Premium' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center p-6">
        {children}
      </body>
    </html>
  )
}
