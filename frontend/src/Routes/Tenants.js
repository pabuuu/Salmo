import React from "react";
import Dropdown from "../components/Dropdown";
function Tenants() {
  //useEffects

  //usestates ulit

  return (
    <div className=" p-4">
      <div className="mb-4">
        <h1>Tenants</h1>
        <span>12 Tenants found</span>
      </div>
      {/* exact dashbaord */}
      <div className="w-100 bg-light">
        {/* Search bar */}
        <div className="d-flex gap-2 align-items-center"> 
          <button className="green-btn py-2 px-3 fw-normal">Add Tenant <span className="ms-2 fw-bold">+</span> </button>
          <div className="ms-auto">
            <Dropdown label="Filter by" >
              <li><a className="dropdown-item" href="#">Newest</a></li>
              <li><a className="dropdown-item" href="#">Oldest</a></li>
              <li><a className="dropdown-item" href="#">Alphabetical ↑</a></li>
              <li><a className="dropdown-item" href="#">Alphabetical ↓</a></li>
            </Dropdown>  
            <input
              placeholder="Enter Tenant" // useEffect with hook para auto update sya
              // value={{}}
              // onChange={(e) => setUsername(e.target.value)}
              className="custom-input my-1 me-2"
            />
            <button className="custom-button py-2 px-3 fw-normal">Search</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tenants;