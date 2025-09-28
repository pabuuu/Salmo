import React from 'react'
import '../styles/Components.css'
export default function Dropdown({label = "Dropdown",children}) {
  return (
    <div className="btn-group mx-2 bg-dark">
        <button className="btn dropdown-toggle text-white" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {label}
        </button>
        <ul className="dropdown-menu">
            {children}
        </ul>
    </div>
  )
}