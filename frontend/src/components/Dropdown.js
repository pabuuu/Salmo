import React from 'react'
import '../styles/Components.css'
export default function Dropdown({label = "Dropdown",children, width,height}) {
  return (
    <div className="btn-group bg-dark" style={{width,height}}> 
      <button className="btn dropdown-toggle text-white" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {label}
      </button>
      <ul className="dropdown-menu w-100">
        {children}
      </ul>
    </div>
  )
}