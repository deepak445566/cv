// src/components/Navbar.jsx - FIXED VERSION
import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

function Navbar() {
  const [open, setOpen] = React.useState(false)
  const { user, setUser, setShowLogin, navigate, setSearch, search, getcount, axios } = useAppContext();

  useEffect(() => {
    if (search && search.trim().length > 0) {
      navigate("/products")
    }
  }, [search])

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout")
      if (data.success) {
        toast.success(data.message)
        setUser(null);
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logged out")
      setUser(null);
      navigate('/');
    }
  }

  // ✅ Safe cart count
  const cartCount = getcount();

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-2 border-b border-gray-300 bg-white relative transition-all z-40">
        <NavLink to='/' onClick={() => setOpen(false)}>
          <img src="/logo1.png" className='h-15 w-15' alt="Logo" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">All Products</NavLink>
          <NavLink to="/">Contact</NavLink>

          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input 
              onChange={(e) => setSearch(e.target.value)} 
              value={search || ""}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" 
              type="text" 
              placeholder="Search products" 
            />
            <img src={assets.search_icon} className='w-4 h-4' alt="Search" />
          </div>

          <div onClick={() => navigate("/cart")} className="relative cursor-pointer ">
            <img src={assets.nav_cart_icon} className='w-6 opacity-80' alt="Cart" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {!user ? (
            <button 
              onClick={() => setShowLogin(true)} 
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className='relative group'>
              <img src={assets.profile_icon} className='w-10' alt="Profile" />
              <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-40 rounded-md text-sm z-40'>
                <li 
                  onClick={() => navigate("/myOrders")} 
                  className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'
                >
                  My Orders
                </li>
                <li 
                  onClick={handleLogout} 
                  className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className='flex items-center gap-6 sm:hidden'>
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer ">
            <img src={assets.nav_cart_icon} className='w-6 opacity-80' alt="Cart" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu">
            <img src={assets.menu_icon} alt="Menu" />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>All Products</NavLink>
          {user && (
            <NavLink to="/myOrders" onClick={() => setOpen(false)}>My Orders</NavLink>
          )}
          <NavLink to="/" onClick={() => setOpen(false)}>Contact</NavLink>

          {!user ? (
            <button 
              onClick={() => { setOpen(false); setShowLogin(true); }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <button 
              onClick={() => { setOpen(false); handleLogout(); }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar