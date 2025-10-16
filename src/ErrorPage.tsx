import { useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError() as Error
  console.error(error)

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <h1 className='text-3xl font-bold'>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error?.message}</i>
      </p>
    </div>
  )
}