import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';

function AllProduct() {

const {products,search}=useAppContext();

const[filterProducts,setFilterProducts]= useState([])
useEffect(()=>{
if(search.length>0){
setFilterProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(search.toLowerCase())
        ))
}else {
      setFilterProducts(products);
    }



},
[products,search])

  return (
    <>
    <div className='mt-16 flex flex-col'>
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium uppercase'>All Products</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'>

        </div>

      </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-6 md:gap-6 gap-3'>
{filterProducts.filter((pro)=>pro.inStock).map((pro,index)=>(
  <ProductCard key={index} product={pro}/>
))}
        </div>

    </div>
    </>
  )
}

export default AllProduct