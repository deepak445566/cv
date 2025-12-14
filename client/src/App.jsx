import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProduct from './pages/AllProduct';
import Productcato from './pages/Productcato';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Addaddress from './components/Addaddress';
import Myorders from './pages/Myorders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import Addproduct from './pages/seller/Addproduct';
import ProductList from './pages/seller/ProductList';
import Order from './pages/seller/Order';
import Loading from './components/Loading';

function App() {

  const isSellerPath = useLocation().pathname.includes("seller");
const {showLogin,isSeller} =useAppContext();


  return (
  <>
  <div className='text-default min-h-screen text-gray-700 bg-white'>
{isSellerPath ? null : <Navbar/>}
{showLogin ? <Login/> : null}
<Toaster></Toaster>
<div className={` ${isSellerPath ? " ":"px-6 md:px-16 lg:px-24 xl:px-32" }`}>
  <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/products' element={<AllProduct/>}/>
    <Route path='/products/:category' element={<Productcato/>}/>
    <Route path='/products/:category/:id' element={<ProductDetail/>}/>
  <Route path='/cart' element={<Cart/>}/>
  <Route path='/add-address' element={<Addaddress/>}/>
  <Route path='/myOrders' element={<Myorders/>}/>
<Route path="/loader" element={<Loading/>}/>



  <Route path='/seller' element={isSeller?<SellerLayout/> :<SellerLogin/>}>
  <Route index element={isSeller?<Addproduct/>:null} />
<Route path='product-list' element={isSeller?<ProductList/>:null} />
<Route path='orders' element={<Order/>}/>
  
  
  
  </Route>


  </Routes>
</div>
 {!isSellerPath && <Footer />}
</div>
  </>
  )
}

export default App