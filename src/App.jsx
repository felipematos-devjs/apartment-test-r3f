import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Canvas3d from './components/Canvas3d/Canvas3d'
import { Suspense } from 'react'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Suspense>
        <Canvas3d />
      </Suspense>
    </>
  )
}

export default App
