import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './pages/index.jsx' 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
