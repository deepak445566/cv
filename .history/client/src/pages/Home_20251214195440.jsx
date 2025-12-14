import React from 'react'

import MainBanner from '../components/MainBanner'

import BestSeller from '../components/BestSeller'

import NewsLetter from '../components/NewsLetter'
import OurStory from '../components/ourStory'

export default function() {
  return (
   <>
   <div className='mt-10'>
    <MainBanner/>
   
    <BestSeller/>
    <OurStory/>
  
   
   </div>
   </>
  )
}
