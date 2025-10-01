import React from 'react'
import '../styles/Components.css'
export default function Dropdown({label = "Dropdown",children, width,height,disabled = false }) {
  return (
    <div className="btn-group bg-light" style={{width,height}} > 
      <button className="btn dropdown-toggle text-dark border" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled={disabled}>
        {label}
      </button>
      <ul className="dropdown-menu w-100">
        {children}
      </ul>
    </div>
  )
}