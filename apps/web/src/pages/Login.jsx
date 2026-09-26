import BackgroundBlobs from '../components/auth/BackgroundBlobs'
import LoginCard from '../components/auth/LoginCard'
import useDocumentTitle from '../hooks/useDocumentTitle'

function Login() {
  useDocumentTitle('Iniciar sesión')

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-10 font-sans text-ink">
      <BackgroundBlobs />
      <div className="relative flex w-full justify-center">
        <LoginCard />
      </div>
    </main>
  )
}

export default Login
