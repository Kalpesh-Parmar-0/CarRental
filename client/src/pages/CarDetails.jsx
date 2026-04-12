import React, { useEffect, useState, useRef } from 'react'
import {useNavigate, useParams}  from 'react-router-dom'
import {assets} from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {motion, AnimatePresence} from 'motion/react'

const CarDetails = () => {

  const {id} = useParams()
  const {cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate} = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // ✅ current image
  const [direction, setDirection] = useState(1) // ✅ 1 = next, -1 = prev for animation
  const autoSlideRef = useRef(null) // ✅ ref to clear interval
  const currency = import.meta.env.VITE_CURRENCY

  // ✅ auto slide every 4 seconds
  const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
          setDirection(1)
          setCurrentImageIndex(prev =>
              prev === car?.images.length - 1 ? 0 : prev + 1
          )
      }, 4000)
  }

  // ✅ clear and restart auto slide on manual navigation
  const resetAutoSlide = () => {
      clearInterval(autoSlideRef.current)
      startAutoSlide()
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentImageIndex(prev =>
      prev === car.images.length - 1 ? 0 : prev + 1
    )
    resetAutoSlide()
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentImageIndex(prev =>
      prev === 0 ? car.images.length - 1 : prev - 1
    )
    resetAutoSlide()
  }
  
  const handleDotClick = (index) => {
    setDirection(index > currentImageIndex ? 1 : -1)
    setCurrentImageIndex(index)
    resetAutoSlide()
  }

  // ✅ start auto slide when car loads
  useEffect(() => {
    if (car?.images?.length > 1) {
        startAutoSlide()
    }
    return () => clearInterval(autoSlideRef.current) // cleanup on unmount
  }, [car])

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const {data} = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate, returnDate
      })

      if(data.success){
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    setCar(cars.find(car => car._id === id))
  },[cars, id])

  // ✅ animation variants for image slide
  const imageVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 })
  }
  
  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="arrow" className='rotate-180 opacity-65' />
        Back To All Cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* left: car image and details */}
        <motion.div 
          initial = {{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className='lg:col-span-2'>

          {/* ✅ image carousel */}
          <div className='relative w-full overflow-hidden rounded-xl shadow-md'>

            {/* ✅ animated image */}
            <AnimatePresence custom={direction} mode='wait'>
            <motion.img
              key={currentImageIndex}
              custom={direction}
              variants={imageVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{duration: 0.4}}
              src={car.images[currentImageIndex].url}
              alt={`car-${currentImageIndex}`}
              className='w-full h-auto md:max-h-100 object-cover'
            />
            </AnimatePresence>

            {/* ✅ prev/next arrows — only show if more than 1 image */}
            {car.images.length > 1 && (
              <>
              <button
                onClick={handlePrev}
                className='absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-all'>
                ‹
              </button>
              <button
                onClick={handleNext}
                className='absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-all'>
                ›
              </button>

              {/* ✅ dot indicators */}
              <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
                {car.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === currentImageIndex
                      ? 'bg-white w-4'      // ✅ active dot wider
                      : 'bg-white/50'       // inactive dot
                    }`}
                  />
                ))}
              </div>
              </>
            )}
          </div>

          {/* ✅ thumbnail strip */}
          {car.images.length > 1 && (
            <div className='flex gap-2 mt-3 overflow-x-auto'>
              {car.images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`thumb-${index}`}
                  onClick={() => handleDotClick(index)}
                  className={`h-16 w-24 object-cover rounded-lg cursor-pointer transition-all ${
                  index === currentImageIndex
                  ? 'border-2 border-primary opacity-100'
                  : 'opacity-50 hover:opacity-80'
                  }`}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className='space-y-6 mt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold mt-3'>{car.brand} {car.model}</h1>
                <p className='text-gray-500 text-lg'>{car.category} | {car.year}</p>
              </div>
              

              {/* car owner info */}
              {car.owner && (
                <div className='flex items-center gap-3 mt-3'>
                  <div>
                      <p className='text-gray-500 text-sm'>Listed by <span className='text-gray-800 font-medium'>{car.owner.name}</span></p>
                      <p className='text-gray-500 text-sm'>Email: <span className='text-gray-800 font-medium'>{car.owner.email}</span></p>
                    </div>
                  {/* show owner image or first later */}
                  {car.owner.image ? (
                    <img src= {car.owner.image} alt={car.owner.name}
                    className= 'w-8 h-8 rounded-full border border-gray-200'
                    />
                    ) : (
                      <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold'>
                        {car.owner.name.charAt(0).toUpperCase()}
                      </div>
                  )}
                </div>
              )}
            </div>
            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                {icon: assets.fuel_icon, text: `${car.fuel_type}`},
                {icon: assets.car_icon, text: `${car.transmission}`},
                {icon: assets.location_icon, text: `${car.location}`}
              ].map(({icon, text}) => (
                <motion.div
                  initial={{opacity: 0, y: 10}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{duration: 0.4}}
                  key={text}
                  className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </motion.div>
              ))}
            </div>
          
            {/* description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* ✅ features from DB */}
            {car.features && car.features.length > 0 && (
              <div>
                <h1 className='text-xl font-medium mb-3'>Features</h1>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {car.features.map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* right:booking form */}
        <div>
          <motion.form 
          initial = {{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.3}}
          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p>

            <hr className='border-borderColor my-6' />

            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <input value={pickupDate} onChange={(e)=> setPickupDate(e.target.value)} type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor="return-date">Return Date</label>
              <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' min={new Date().toISOString().split('T')[0]} />
            </div>

            <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>

            <p className='text-center text-sm'>No credit card require to reserve</p>
          </motion.form>
        </div>
      </div>
      
    </div>
  ) : <Loader />
}

export default CarDetails
