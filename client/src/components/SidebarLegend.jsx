import { Card, Collapse } from 'react-bootstrap';
import '../App.css'
import { useEffect, useState } from 'react';


function SidebarLegend ({loggedIn}) {
  const [infoOpened, setInfoOpened] = useState(false);


  

  return (
    <>
        {/* Info Button */}
        <i 
          className="bi bi-info-circle-fill h2 info-button" 
          onClick={() => setInfoOpened(!infoOpened)} 
          style={{color:'FDFDFD'}} 
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} 
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} 
          onFocus={ () => {} } 
          onKeyDown={(e) => handleKeyDown(e)} 
          aria-label='open sidebar for legend' 
        ></i>

        {/* Sidebar */}
        <Collapse in={infoOpened} dimension={'width'} className='sidebar'>
          <Card className='p-3 pe-3 pt-4 text-start'>
            <Card.Title className='mt-3 text-center'>Legend</Card.Title>
            <Card.Body className='mt-2'>
            {/* Node Types */}
            <div className='mb-4'>
              <h6>Node types</h6>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/design_doc.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Design document</label>
                </div>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/informative_doc.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Informative document</label>
                </div>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/prescriptive_doc.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Prescriptive document</label>
                </div>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/technical_doc.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Technical document</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/agreement.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Agreement</label>
                </div>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/conflict.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Conflict</label>
                </div>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/consultation.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Consultation</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/action.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Action</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img src='/src/icon/000000/other.svg' style={{marginRight: '10px', width:'20px'}} />
                  <label>Other</label>
                </div>
              </div>
            </div>
            {/* Stakeholders */}
            <div className='mb-4'>
              <h6>Stakeholders</h6>
              <div className='d-flex mt-3'>
                <div className='ms-3'>
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#000000" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>LKAB</label>
                  </div>
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#8C6760" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>Municipality</label>
                  </div>              
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#702F36" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>Norrbotten Country</label>
                  </div>              
                </div>
                <div className='ms-3'>
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#B6AD9D" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>Architecture Firms</label>
                  </div>              
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#B3D0D3" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>Citizens</label>
                  </div>              
                  <div className='d-flex my-1 align-items-center'>
                    <svg width="20" height="20">
                      <circle
                        cx="10" // X-coordinate of the center
                        cy="10" // Y-coordinate of the center
                        r="8"   // Radius
                        fill="#8A9FA4" // Circle fill color
                      />
                    </svg>
                    <label className='ms-3'>Others</label>
                  </div>
                </div> 
              </div>
            </div>
            {/* Connections */}
            {loggedIn &&
            <div className='mb-4'>
              <h6>Connections</h6>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1 align-items-center'>
                  <svg width="50" height="20">
                    <line
                      x1="0" // Starting x-coordinate
                      y1="10" // Starting y-coordinate
                      x2="50" // Ending x-coordinate
                      y2="10" // Ending y-coordinate
                      stroke="black" // Line color
                      strokeWidth="1" // Line thickness
                      strokeDasharray='0'
                      />
                  </svg>
                  <label className='ms-3'>Direct consequence</label>
                </div>
                <div className='d-flex my-1 align-items-center'>
                  <svg width="50" height="20">
                    <line
                      x1="0" // Starting x-coordinate
                      y1="10" // Starting y-coordinate
                      x2="50" // Ending x-coordinate
                      y2="10" // Ending y-coordinate
                      stroke="black" // Line color
                      strokeWidth="1" // Line thickness
                      strokeDasharray='5,5'
                      />
                  </svg>
                  <label className='ms-3'>Collateral consequence</label>
                </div>
                <div className='d-flex my-1 align-items-center'>
                  <svg width="50" height="20">
                    <line
                      x1="0" // Starting x-coordinate
                      y1="10" // Starting y-coordinate
                      x2="50" // Ending x-coordinate
                      y2="10" // Ending y-coordinate
                      stroke="black" // Line color
                      strokeWidth="1" // Line thickness
                      strokeDasharray='1,3'
                      />
                  </svg>
                  <label className='ms-3'>Projection</label>
                </div>
                <div className='d-flex my-1 align-items-center'>
                  <svg width="50" height="20">
                    <line
                      x1="0" // Starting x-coordinate
                      y1="10" // Starting y-coordinate
                      x2="50" // Ending x-coordinate
                      y2="10" // Ending y-coordinate
                      stroke="black" // Line color
                      strokeWidth="1" // Line thickness
                      strokeDasharray='8,4,1,4'
                      />
                  </svg>
                  <label className='ms-3'>Update</label>
                </div>
              </div>
            </div>
            }
            </Card.Body>
          </Card>
        </Collapse>
    </>
  )
}

export default SidebarLegend;