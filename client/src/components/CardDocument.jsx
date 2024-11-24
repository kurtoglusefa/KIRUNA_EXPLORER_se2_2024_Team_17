import { useEffect, useState } from "react";
import { Badge, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../API";

function CardDocument ({document, locationType, latitude, longitude, setShowCard, setSelectedDocument, isLogged, viewMode, areaName, numberofconnections}) {
  const navigate = useNavigate();
  
  const [resource, setResource] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [scales, setScales] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
          const res = await API.getDocumentResources(document.IdDocument);
          setResource(res);
      } catch (err) {
        console.log(err);
        if(err === 404) {
          setResource([]);
        } else {
          setMessage('Error fetching resources');
        }
      }
    };
    const fetchStakeholders = async () => {
      try {
        const res = await API.getAllStakeholders();
        setStakeholders(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchScales = async () => {
      try {
        const res = await API.getScales();
        res.map(scale => scales[scale.IdScale] = { scale_text: scale.scale_text, scale_number: scale.scale_number });
        console.log(res);
        setScales(res);
      } catch (err) {
        console.error(err);
      }
    };
  
      fetchResources();
      fetchStakeholders();
      fetchScales();
  }, [document.IdDocument]);

  
 
  const handleModifyDocument = () => {
    if (document) {
      setShowCard(false);
      navigate(`/documents/modify-document/${document.IdDocument}`, { state: { document: document , location: (latitude && longitude) ? {lat: latitude, lng: longitude} : null, area: areaName ? areaName : null} });
    }
  };
  console.log(document);
  
  return (
    <Card>
      <Button 
        variant="close"
        onClick={() => {
          if(viewMode == 'map') {
          setShowCard(false);
          }
          setSelectedDocument(null);
        }} 
        style={{ 
          position: 'absolute', 
          top: '2%', 
          right: '2%' 
          }} 
          />
      <Card.Header className='document px-4'>
        <Card.Title><strong>{document?.Title}</strong></Card.Title>
      </Card.Header>
      <Card.Body className='document-card text-start'>
        <div className='d-flex'>

          <div className='col-6 m-1'>

            <Card.Text style={{ fontSize: '16px' }}><strong>Date:</strong> {document?.Issuance_Date}</Card.Text>
            <Card.Text style={{ fontSize: '16px' }}><strong>Scale Name:</strong> {scales[document?.IdScale-1] ? scales[document?.IdScale-1].scale_text : ""}</Card.Text>
            {scales[document?.IdScale] && scales[document?.IdScale].scale_number !== '' ? (
              <Card.Text style={{ fontSize: '16px' }}>
                <strong>Scale Number: </strong>
                {scales[document?.IdScale-1].scale_number}
              </Card.Text>
            ) : null}            
            {document?.Language && <Card.Text style={{ fontSize: '16px' }}><strong>Language:</strong> {document?.Language}</Card.Text>}
            {document?.IdStakeholder && stakeholders && <Card.Text style={{ fontSize: '16px' }}><strong>Stakeholder :</strong> {stakeholders.find(s => s.id === document.IdStakeholder)?.name || 'Unknown'}</Card.Text>}
            {document?.Pages && <Card.Text style={{ fontSize: '16px' }}><strong>Pages:</strong> {document?.Pages}</Card.Text>}
            {/*<Card.Text style={{ fontSize: '16px' }}><strong>Type: </strong> {locationType}</Card.Text>*/}
            <Card.Text style={{ fontSize: '16px'}}><strong>Connections:</strong> {numberofconnections}</Card.Text>
            <Card.Text style={{ fontSize: '16px' }}>
              <strong>Original Resource:</strong><br></br>
              <div style={{ overflowY: "auto",maxHeight : "100px"}}>
                {resource.length > 0 ? (
                  resource.map((res, index) => (
                    <>
                      <a href={`http://localhost:3001${res.url}`} target="_blank" key={index} style={{fontSize:'13px'}} ><u>{res.filename}</u></a>
                      <br></br>
                    </>
                  ))
                
                ): (
                  <span style={{fontSize:'13px'}}>No original resource added</span>
                )}
              </div>
              </Card.Text>
            {isLogged &&
              <Badge bg='light' className="p-3 mt-4" style={{color:'black', fontWeight:'normal'}}>
              {locationType == 'Point' ? (
              <>
                <Card.Text style={{ fontSize: '16px' }}>
                <strong>Latitude:</strong> {latitude}
                </Card.Text>
                <Card.Text style={{ fontSize: '16px' }}>
                    <strong>Longitude:</strong> {longitude}
                  </Card.Text>
                </>  
              ) : (
                <>
                <Card.Text style={{ fontSize: '16px'}}>
                <strong>Area:</strong> {areaName}
                </Card.Text>
                </>
                ) 
              }
              </Badge>
            }
          </div>
          <div className="m-1"> 
            <strong style={{fontSize:'16px'}}>Description:</strong>
            <Card.Text style={{marginTop:'5px',height: '300px', overflowY: 'auto' , fontSize: '16px' }}>{document?.Description}</Card.Text>
          </div>
        </div>
      </Card.Body>
      {isLogged && (
        <Card.Footer className=' text-end' >
          <Button variant="secondary" className='btn-document rounded-pill px-3' onClick={handleModifyDocument}>Modify</Button>
        </Card.Footer>
      )}
    </Card>
  )
}

export default CardDocument;