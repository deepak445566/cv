import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

function Productcato() {
  const {products}=  useAppContext();

const {category} = useParams();
const serchcato = categories.find((item)=>item.path.toLowerCase()=== category)
const flterpro = products.filter((pro)=>pro.category.toLowerCase() === category)






  return (
    <>
    <div  className='mt-16'>
{serchcato && (
  <div className='flex flex-col items-end w-max'>
<p className='text-2xl font-medium'>{serchcato.text.toUpperCase()}</p>
<div className='w-16 h-0.5 bg-primary rounded-full'></div>
  </div>
)}
{flterpro.length> 0?(
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-6 md:gap-6 gap-3'>

    {flterpro.map((pro)=>(
      <ProductCard key={pro._id} product={pro}/>
    ))}
  </div>
):(
  <div className='flex item justify-center h-[60vh]'
  >
<p>No products Found in this Category</p>

  </div>
)}
    </div>
    </>
  )
}

export default Productcato