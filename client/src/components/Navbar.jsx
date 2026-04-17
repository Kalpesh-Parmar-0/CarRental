import React, { useState, useRef, useEffect } from 'react'
import {assets, menuLinks} from '../assets/assets'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {motion} from 'motion/react'

const Navbar = () => {

    const {setShowLogin, user, logout, isOwner, axios, setIsOwner, fetchUser} = useAppContext()

    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false) // ✅ avatar dropdown
    const dropdownRef = useRef(null) // ✅ ref for dropdown to detect outside clicks
    const navigate = useNavigate()

    const changeRole = async ()=>{
        try {
            const {data} = await axios.post('/api/owner/change-role')
            if(data.success) {
                await fetchUser()
                setIsOwner(true)
                toast.success(data.message)
                navigate('/owner/add-car')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ✅ close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

  return (
    <motion.div
    initial= {{y: -20, opacity: 0}}
    animate= {{y: 0, opacity: 1}}
    transition={{duration: 0.5}}
    className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${location.pathname === "/" && "bg-light"}`}>
        <Link to='/'>
            <motion.img whileHover={{scale: 1.05}} src= {assets.logo} alt="logo" className='h-8' />
        </Link>

        <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
            {menuLinks.map((link, index) => (
                <Link key={index} to={link.path}>
                    {link.name}
                </Link>
            ))}

            {/* <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                <input type="text" className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" placeholder='Search Products' />
                <img src={assets.search_icon} alt="search" />
            </div> */}

            <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
                <button onClick={()=> isOwner ? navigate('/owner') : changeRole()} className='cursor-pointer'>{isOwner ?  'Dashboard' : 'List Cars'}</button>

                {/* <button onClick={()=> {user ? logout() : setShowLogin(true)}} className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg'>{user ? 'Logout' :  'Login'}</button> */}
                
                {user ? (
                    // ✅ avatar with dropdown when logged in
                    <div className='relative' ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className='cursor-pointer flex items-center gap-2'>
                            

                            {/* ✅ show image if uploaded, else show first letter */}
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className='w-9 h-9 rounded-full object-cover border-2 border-primary'
                                />
                            ) : (
                                <div className='w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm border-2 border-primary'>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </button>

                        {/* ✅ dropdown menu */}
                        {showDropdown && (

                            
                            <div className='absolute right-0 top-12 bg-white border border-borderColor rounded-lg shadow-lg py-2 w-40 z-50'>
                                <span className='w-full text-left px-4 py-2 text-primary'>
                                {user.name.split(' ')[0]} {/* ✅ show first name only */}
                            </span>
                            <hr className='my-1 border-borderColor' />
                                <button
                                    onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                                    className='w-full text-left px-4 py-2 hover:bg-gray-50 text-sm cursor-pointer'>
                                    My Profile
                                </button>
                                <button
                                    onClick={() => { navigate('/my-bookings'); setShowDropdown(false) }}
                                    className='w-full text-left px-4 py-2 hover:bg-gray-50 text-sm cursor-pointer'>
                                    My Bookings
                                </button>
                                <hr className='my-1 border-borderColor' />
                                <button
                                    onClick={() => { logout(); setShowDropdown(false) }}
                                    className='w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500 cursor-pointer'>
                                    Logout
                                </button>
            </div>
                        )} 
        </div> ) : (
            // ✅ show login button when not logged in
                    <button
                        onClick={() => setShowLogin(true)}
                        className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg'>
                        Login
                    </button>
        )}
        </div>
        </div>
        
        <button className='sm:hidden cursor-pointer' aria-label='Menu' onClick={()=> setOpen(!open)}>
            <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
    </motion.div>
  )
}

export default Navbar
