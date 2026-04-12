import React, { useState, useRef, use } from 'react'
import { assets} from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState('')
    const [suggestions, setSuggestions] = useState([]) // ✅ filtered suggestions
    const [showSuggestions, setShowSuggestions] = useState(false) // ✅ toggle list
    const isSelectingRef = useRef(false) // ✅ track if user is clicking suggestion

    const {pickupDate, setPickupDate, returnDate, setReturnDate, navigate, cities} = useAppContext()

    // ✅ filter cities based on input
    const handleLocationChange = (e) => {
        const value = e.target.value
        setPickupLocation(value)

        if (value.trim() === '') {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const filtered = cities.filter(city =>
            city.toLowerCase().includes(value.toLowerCase())
        )
        setSuggestions(filtered)
        setShowSuggestions(true)
    }

    const handleSlecteCity = (city) => {
      setPickupLocation(city)
      setSuggestions([])
      setShowSuggestions(false)
      isSelectingRef.current = false
    }

    // ✅ only hide suggestions if user is NOT clicking a suggestion
    const handleBlur = () => {
        if (!isSelectingRef.current) {
            setShowSuggestions(false)
        }
    }

    const handleSearch = (e) => {
      e.preventDefault()

      // ✅ validate location is from city list
        if (!cities.includes(pickupLocation)) {
            return toast.error("Please select a valid city from suggestions")
        }

        // ✅ validate return date after pickup date
        if (new Date(returnDate) <= new Date(pickupDate)) {
            return toast.error("Return date must be after pickup date")
        }
      navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
    }

  return (
    <motion.div
    initial = {{opacity:0}}
    animate = {{opacity: 1}}
    transition={{duration: 0.8}}
    className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center'>
      <motion.h1 
      initial ={{y:50, opacity: 0}}
      animate = {{y: 0, opacity: 1}}
      transition = {{duration: 0.8,delay: 0.2}}
      className='text-4xl md:text-5xl font-semibold'>Luxury Cars On Rent</motion.h1>

      <motion.form
      initial = {{scale: 0.95, opacity: 0, y: 50}}
      animate = {{scale:1, opacity:1, y:0}}
      transition ={{duration: 0.6, delay: 0.4}}
      onSubmit={handleSearch} 
      className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'>

        <div className='flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8'>

            <div className='flex flex-col items-start gap-2 relative'>
              <label htmlFor="pickup-location">Pickup Location</label>
              <input 
                id='pickup-location'
                type="text"
                value={pickupLocation}
                onChange={handleLocationChange}
                onBlur={handleBlur}
                // onFocus={()=> pickupLocation && setSuggestions.length > 0 && setSuggestions(true)}
                placeholder='type city name...'
                className='text-sm text-gray-500 outline-none'
                required
                autoComplete='off'
              />
              {/* ✅ suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                  <div className='absolute top-14 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 max-h-48 overflow-y-auto'>
                      {suggestions.map((city) => (
                          <div
                              key={city}
                              onMouseDown={() => isSelectingRef.current= true}
                              onMouseUp={()=> handleSlecteCity(city)}
                              className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-left'>
                              {city}
                          </div>
                      ))}
                  </div>
              )}

              {/* ✅ no results message */}
              {showSuggestions && suggestions.length === 0 && pickupLocation && (
                  <div className='absolute top-14 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48'>
                      <p className='px-4 py-2 text-sm text-gray-400'>No cities found</p>
                  </div>
              )}
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor="pickup-date">Pick-up Date</label>
                <input value={pickupDate} onChange={e => setPickupDate(e.target.value)} type="date" id="pickup-date" min={new Date().toISOString().split('T')[0]} className='text-sm text-gray-500' required/>
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor="return-date">Return Date</label>
                <input value={returnDate} onChange={e => setReturnDate(e.target.value)} type="date" id="return-date" min={pickupDate || new Date().toISOString().split('T')[0]} className='text-sm text-gray-500' required/>
            </div>
        </div>
        <motion.button
        whileHover={{scale: 1.05}}
        whileTap={{scale:0.95}}
        className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'>
            <motion.img
            initial = {{y: 100, opacity:0}}
            animate = {{y:0, opacity: 1}}
            transition={{duration: 0.8, delay: 0.6}}
            src={assets.search_icon} alt="search" className='brightness-300'/>
            Search
        </motion.button>
      </motion.form>

      <img src={assets.main_car} alt="car" className='max-h-74'/>
    </motion.div>
  )
}

export default Hero
