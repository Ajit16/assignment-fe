import QueryProvider from './providers'
import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'Example Next.js + React Query setup',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <h1 className='text-2xl font-bold text-center my-4'>File Upload App</h1>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
