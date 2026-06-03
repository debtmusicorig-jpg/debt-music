import React from 'react'
import Layout from '../Layout.jsx'
import Releases from '../components/Releases.jsx'
import BioText from '../entities/BioText.json'
import BioMedia from '../entities/BioMedia.json'

export default function BioPage() {
  return (
    <Layout>
      <Releases textData={BioText} mediaData={BioMedia} isPreview={true} />
    </Layout>
  )
}
