import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className='sp-4 overflow-hidden h-screen'>
      <h1 className='text-2xl font-bold text-center my-4'>File Upload App</h1>
      <Outlet />
    </div>
  )
}

export default App