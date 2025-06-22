import React from 'react'
import logo from '../../assets/logo.png'

function Footer() {
  return (
    <>
      <div className="bg-gray-200 py-4 px-6 shadow-md md:flex justify-between items-center">
        <p className="text-center text-xs md:text-sm text-gray-500">Copyright © 2023 <span className='text-green-600'>Fashion Group</span> All rights reserved.</p>
        <p className='text-center text-xs md:text-sm text-gray-500'>Developed by <span className='font-medium text-blue-900 cursor-pointer'>Fashion IT</span></p>
      </div>
    </>
  )
}

export default Footer