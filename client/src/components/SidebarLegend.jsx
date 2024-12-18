import { Card, Collapse } from 'react-bootstrap';
import '../App.css'
import {useState } from 'react';


function SidebarLegend () {
  const [infoOpened, setInfoOpened] = useState(false);


  

  return (
    <>
        {/* Info Button */}
        <i 
          tabIndex="0"
          className="bi bi-info-circle-fill h2 info-button" 
          onClick={() => setInfoOpened(!infoOpened)} 
          style={{color:'FDFDFD'}} 
          onMouseEnter={(e) => e.target.style.transform = 'scale(0.9)'} 
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} 
          onFocus={ () => {} } 
          onKeyDown={() => {}} 
          aria-label='open sidebar for legend' 
          role="button"
        ></i>

        {/* Sidebar */}
        <Collapse in={infoOpened} dimension={'width'} className='sidebar'>
          <Card className='p-3 pe-3 pt-4 text-start'>
            <Card.Title className='mt-3 text-center'>Legend</Card.Title>
            <Card.Body className='mt-2'>
            {/* Node Types */}
            <div className='mb-4'>
              <h6>Document types</h6>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img id="design_doc" src='/src/icon/000000/design_doc.svg' alt="design document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor="design_doc">Design document</label>
                </div>
                <div className='d-flex my-1'>
                  <img id="informative_doc" src='/src/icon/000000/informative_doc.svg'  alt="informative document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor="informative_doc" >Informative document</label>
                </div>
                <div className='d-flex my-1'>
                  <img id="prescriptive_doc" src='/src/icon/000000/prescriptive_doc.svg' alt="prescriptive document"  style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor="prescriptive_doc" >Prescriptive document</label>
                </div>
                <div className='d-flex my-1'>
                  <img id="technical_doc" src='/src/icon/000000/technical_doc.svg' alt="technical document"  style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='technical_doc'>Technical document</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img id="agreement_doc" src='/src/icon/000000/agreement.svg' alt="agreement document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='agreement_doc'>Agreement</label>
                </div>
                <div className='d-flex my-1'>
                  <img id="conflict_doc"src='/src/icon/000000/conflict.svg' alt="conflict document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='conflict_doc'>Conflict</label>
                </div>
                <div className='d-flex my-1'>
                  <img id="consultation_doc" src='/src/icon/000000/consultation.svg' alt="consultation document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='consultation_doc'>Consultation</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img id="action_doc"src='/src/icon/000000/action.svg' alt="action document"  style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='action_doc'>Action</label>
                </div>
              </div>
              <div className='ms-3 mt-3'>
                <div className='d-flex my-1'>
                  <img id="other_doc" src='/src/icon/000000/other.svg' alt="other document" style={{marginRight: '10px', width:'20px'}} />
                  <label htmlFor='other_doc'>Other</label>
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
                    <span className='ms-3'>LKAB</span >
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
                    <span className='ms-3'>Municipality</span>
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
                    <span className='ms-3'>Norrbotten Country</span>
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
                    <span className='ms-3'>Architecture Firms</span>
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
                    <span className='ms-3'>Citizens</span>
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
                    <span className='ms-3'>Others</span>
                  </div>
                </div> 
              </div>
            </div>
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
                  <span className='ms-3'>Direct consequence</span>
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
                  <span className='ms-3'>Collateral consequence</span>
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
                  <span className='ms-3'>Projection</span>
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
                  <span className='ms-3'>Update</span>
                </div>
              </div>
            </div>
            </Card.Body>
          </Card>
        </Collapse>
    </>
  )
}

export default SidebarLegend;