import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BioPage from './pages/Bio.jsx' 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BioPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
