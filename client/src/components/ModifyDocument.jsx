import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Form, Card, Row, Col, Modal, ListGroup, FloatingLabel, FormGroup, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../API';
function ModifyDocument() {
    let { documentId } = useParams();
    const [showAddConnection, setShowAddConnection] = useState(false);
    const [message, setMessage] = useState('');
    const location = useLocation(); 
    const selectedLocation = location.state.location || {};


    // document fields
    const [title, setTitle] = useState('');
    const [scale, setScale] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('');
    const [pages, setPages] = useState('');
    const [stakeholder, setStakeholder] = useState([]);
    const [type, setType] = useState('');
    const [latitude, setLatitude] = useState(selectedLocation.lat ? selectedLocation.lat : '');
    const [longitude, setLongitude] = useState(selectedLocation.lng ? selectedLocation.lng : '');
    const [area, setArea] = useState(location.state.area ? location.state.area : null);
    const [resources, setResources] = useState([]);
    const [addResources, setAddResources] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState('');
    const [connectionType, setConnectionType] = useState('');
    const [connections, setConnections] = useState([]); // List of added connections
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [stakeholders, setStakeholders] = useState([]);
    const [types, setTypes] = useState([]);
    const [typeConnections, setTypeConnections] = useState([]);  
    const [documentScale, setDocumentScale] = useState('');

    const [documents, setDocuments] = useState([]); // List of all documents
    const [filteredDocuments, setFilteredDocuments] = useState([]); // used to filter documents

    const [showAddScale, setShowAddScale] = useState(false);
    const [scales, setScales] = useState([]);

    //adding new scale 
    const [newScale_name, setNewScale_name] = useState('');
    const [newScale_number, setNewScale_number] = useState('');

    const [oldScale_number, setOldScale_number] = useState('');



    useEffect(() => {
      const fetchResources = async () => {
        try {
            const res = await API.getDocumentResources(documentId);
            setResources(res);
        } catch (err) {
          if(err.response.status === 404) {
            setResources([]);
          } else {
            setMessage('Error fetching resources');
          }
        }
      };
      if(documentId)
        fetchResources();
    }, [addResources]);

    useEffect(() => {
      
        const getStakeholders = async () => {
            try {
                const res = await API.getAllStakeholders();
                setStakeholders(res);
                setStakeholder(res[0].id);
            } catch (err) {
                console.error(err);
            }
        }
        const getTypes = async () => {
          try {
              const res = await API.getAllTypesDocument();
              setTypes(res);
              setType(res[0].id);
          } catch (err) {
              console.error(err);
          }
        }
        const fetchDocuments = async () => {
            try {
                const res = await API.getAllDocuments();
                setDocuments(res);
            } catch (err) {
                console.error(err);
            }
        };
      
        const fetchDocument = async () => {
            try {
                const res = await API.getDocumentById(documentId);
                setDocument(res);
                setTitle(res.Title);
                setScale(res.Scale);
                setLanguage(res.Language);
                setPages(res.Pages);
                setIssuanceDate({
                  year: res.Issuance_Date.substring(0, 4) ? res.Issuance_Date.substring(0, 4) : null,
                  month: res.Issuance_Date.substring(5, 7) ? res.Issuance_Date.substring(5, 7) : null,
                  day: res.Issuance_Date.substring(8, 10) ? res.Issuance_Date.substring(8, 10) : null
                });
                setDescription(res.Description);
                const scalesResponse = await API.getScales();
                setScales(scalesResponse);
                const scaleObj = scalesResponse.find((s) => s.id === res.IdScale);
                setDocumentScale(scaleObj);
                setOldScale_number(scaleObj.scale_number.split(":")[1]);

                const stakeholder = await API.getStakeholder(res.IdStakeholder);
                setStakeholder(stakeholder);
                const type = await API.getTypeDocument(res.IdType);
                setType(type);
            } catch (err) {
                console.error(err);
            }
        };
        const getAllTypeConnections = async () => {
            try {
                console.log("get all type connections");
                const res = await API.getAllTypeConnections();
                console.log(res);

                const typeConnectionId = res.reduce((acc, conn) => {
                    acc[conn.IdConnection] = conn;
                    return acc;
                }, {});
                setTypeConnections(typeConnectionId);
            } catch (err) {
                console.error(err);
            }
        };
        const getDocumentConnections = async () => {
            try {
                const res = await API.getDocumentConnection(documentId);
                setConnections(res);
            } catch (err) {
                console.error(err);
            }
        };
        const getAllScales = async () => {
          try {
              const res = await API.getScales();
              console.log(res);
              setScales(res);
          } catch (err) {
              console.error(err);
          }
        };
        getAllScales();
        fetchDocuments();
        getStakeholders();
        getTypes();
        getAllTypeConnections();
        getDocumentConnections();
        

        if(documentId)
          fetchDocument();
          
    },[]);


    const handleDeleteResource = async (resource) => {
      try {
        console.log(resource);
        await API.deleteResource(resource);
        const res = await API.getDocumentResources(documentId);
        setResources(res);
      } catch (err) {
        setMessage('Error deleting resource');
      }
    };
    const handleTypeScaleChange = (selectedId) => {
      console.log("ho cambiato");
      const selectedScale = scales.find((scale) => scale.id == selectedId);
      console.log(selectedScale); // Now you have the full object
      setDocumentScale(selectedScale); 
      setOldScale_number(selectedScale.scale_number.split(":")[1]);
    };
    const handleScaleChange = (value) => {
      setOldScale_number(value);
    };

    const handleAddScale = async() => {
      //here call api to add a scale
      await API.addScale(newScale_name, newScale_number);
      const res = await API.getScales();
      setScales(res);
      setNewScale_name('');
      setNewScale_number('');
      setShowAddScale(false);
    };
    const addResourcesDocument = async () => {
      if (addResources.length > 0) {
        try {
          // Send FormData to your API function
          await API.addResourcesToDocument(documentId, addResources);
          // Optionally, fetch the updated resources list
          const res = await API.getDocumentResources(documentId);
          setAddResources([]);
          setMessage('');
        } catch (err) {
          setMessage('Error uploading resources:' + err);
        }
      } else {
        setMessage('No files selected');
      }
    };

    const handleUpdate = async() => {
      if(!title || !documentScale || !issuanceDate.year || !description  || !stakeholder || !type){
        setMessage("Please complete all fields to add a document.");
      } else {
        let date;
        if (issuanceDate.year && issuanceDate.month && issuanceDate.day) {
          date = `${issuanceDate.year}/${issuanceDate.month}/${issuanceDate.day}`;
        } else if (issuanceDate.year && issuanceDate.month && !issuanceDate.day) {
          date = `${issuanceDate.year}/${issuanceDate.month}`;
        } else if (issuanceDate.year && !issuanceDate.month && !issuanceDate.day) {
          date = `${issuanceDate.year}`;
        } else {
          setMessage("Please provide a valid date format.");
          return;
        }
        let result;

        // QUA DEVO VEDERE SE HO FATTO AGGIORNAMENTO DELLO SCALE DEVO MANDARE UPDATE SCALE ALTRIMENTI NO
        if(documentScale && documentScale.id > 3){    
          await API.updateScale(documentScale.id,`1:${oldScale_number}`);
        }

        if (documentId) {
          console.log("sto facendo update");
          console.log(documentScale);
          result = documentId;
          await API.updateDocument(documentId, title,stakeholder.id ? stakeholder.id: stakeholder, documentScale.id, date, language, pages,description,  type.id ? type.id: type);
          if(!area)
            await API.updateLocationDocument(document.IdLocation, "Point", latitude, longitude, "");
        } else {
          if( selectedLocation!= null && selectedLocation.lat != null && selectedLocation.lng != null){
            // insert the document which is a point 
            //console.log(selectedLocation);
            //console.log({ title, scale, issuanceDate, description, connections, language, pages, stakeholder: stakeholder, type: type, locationType : "Point", latitude : selectedLocation.lat , longitude: selectedLocation.lng, area_coordinates :"" });
            result = await API.addDocument( title,stakeholder, documentScale.id, date, language, pages,description,  type,  "Point",  latitude , longitude, "" );
            console.log(result);
            result = await result.idDocument;
            documentId = result;
          }
          else if (area){
            //insert the document inside an area
            result = await API.addDocumentArea( title,stakeholder, documentScale.id, date, language, pages,description,  type, area.IdLocation );
            console.log(result);
            result = await result.idDocument;
            documentId = result;
          }
          // insert the document
          /*const result= await API.addDocument({ title, scale, issuanceDate, description, connections, language, pages, stakeholder: stakeholder.id, type: type.id });
          console.log(result);
          navigate('/');*/
        }
        

        if(addResources) {
          try {
            console.log("sto inserendo i file");
            addResourcesDocument();
          } catch (err) {
            console.error(err);
          } 
        }
        setSelectedDocument(null);
        navigate("/home");
      }
    };

    const handleAddConnection = async() => {
        if (selectedDocument && connectionType) {
            await API.createDocumentConnection(documentId, selectedDocument.IdDocument, connectionType);
            // now i have to call again the document to update the connections
            const res = await API.getDocumentConnection(documentId);
            setConnections(res);
            setSelectedDocument('');
            setConnectionType('');
            setShowAddConnection(false);
        } else {
            alert("Please complete all fields to add a connection.");
        }
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setSelectedDocument(searchValue);

        // Filter documents that match the input
        if (searchValue.length > 0) {
        const filtered = documents.filter((doc) =>
            doc.Title.toLowerCase().includes(searchValue.toLowerCase()) && doc.IdDocument != documentId
        );
        setFilteredDocuments(filtered);
        } else {
        setFilteredDocuments([]);
        }
    };
    const handleSelectDocument = (doc) => {
        setSelectedDocument(doc);
        setFilteredDocuments([]); // Clear suggestions after selection
    };
    const handleNewScaleChange = (value) => {
      console.log("new scale");
      console.log(value);
      setNewScale_number(`1:${value}`);
    };
    /* ------------------------------------ FORM ------------------------------------------ */
    return (
      <>
        <Card className="container my-5 bg-light rounded form">
          <Card.Title>
            <h3 className="text-center my-5">{documentId ? 'Update' : 'Create'} Document</h3>
          </Card.Title>
          <Card.Body>
            <Row>
                {/* ---------------------- Left Column --------------------------- */}
                <Col md={6}>
                      <Form.Group controlid="title" className="mb-3">
                          <FloatingLabel label="Title*" className="mb-3">
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                />
                        </FloatingLabel>
                      </Form.Group>
                      
                      <Form.Group controlid="scale" className="mb-3">
                        <InputGroup>
                          <Form.Select
                            required
                            value={ documentScale ? documentScale.id: 0}
                            style={{ width: "20%" }}
                            onChange={(event) => handleTypeScaleChange(event.target.value)}
                            className="font-size-20"
                          >
                            <option value="0">Select scale</option>
                            {scales && scales.map((scale) => (
                              <option key={scale.id} value={scale.id}>
                                {scale.scale_text}
                              </option>
                            ))}
                            
                          </Form.Select>
                          {documentScale && documentScale.id>3  && (
                            <>
                              <Form.Control
                                type="text"
                                placeholder="1:"
                                value="1:"
                                disabled
                                style={{ width: "10%", textAlign: "right" }}
                                className="mt-0 font-size-20"
                              />

                              <Form.Control
                                required
                                type="number"
                                placeholder="XXXX"
                                value={oldScale_number ? oldScale_number : ""}
                                onChange={(event) => handleScaleChange(event.target.value)}
                                className="mt-0 font-size-20"
                                style={{ width: "25%", textAlign: "left" }}
                              />
                            </>
                          )}
                          <Button
                          variant="outline-primary"
                          onClick={()=> setShowAddScale(true)}
                          style={{ width: "20%", textAlign: "left" }}
                          className="mt-2"
                        >
                          Add Scale
                        </Button>
                        </InputGroup>
                      </Form.Group>
                      
                      <Form.Group controlid="language" className="mb-3">
                        <FloatingLabel label="Language" className="mb-3">
                          <Form.Select
                              placeholder='language'
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                            >
                              <option>Select Language</option>
                              <option value="English">English</option>
                              <option value="Swedish">Swedish</option>
                          </Form.Select>
                        </FloatingLabel>
                      </Form.Group>
                      
                      <div className='d-flex justify-content-between'>
                      <Form.Group controlid="pages" className='col-2'>
                        <FloatingLabel label="Pages" className="mb-3">
                          <Form.Control
                              defaultValue={0}
                              size="sm"
                              type="number"
                              value={pages}
                              onChange={(e) => setPages(e.target.value)}
                              min={0}
                              />
                        </FloatingLabel>
                      </Form.Group>
                      
                      <Form.Group controlid="issuanceDate" className="ms-1 mb-3 d-flex align-items-center">
                        <label className='me-2'> Issuance Date:</label>
                        <FloatingLabel label='year*'>

                          <Form.Control 
                            size='sm'
                            controlid='year' 
                            className='mx-1' 
                            type='number' 
                            style={{width:'10ch'}}
                            maxLength={4} 
                            min={2000} 
                            max={2024} 
                            value={issuanceDate.year}
                            onChange={(e)=>setIssuanceDate({year: e.target.value, month: issuanceDate.month, day: issuanceDate.day})} required
                          />
                        </FloatingLabel>
                        /
                        <FloatingLabel label='month'>
                          <Form.Control 
                            size='sm'
                            controlid='month' 
                            className='mx-1' 
                            type='number' 
                            maxLength={2} 
                            style={{width:'8ch'}} 
                            min={1} 
                            max={12} 
                            value={issuanceDate.month} 
                            onInput={(e) => {if(e.target.value < 10) e.target.value = '0' + e.target.value}} 
                            onChange={(e)=>setIssuanceDate({year: issuanceDate.year, month: e.target.value, day: issuanceDate.day})}
                          />
                        </FloatingLabel>
                        /
                        <FloatingLabel label='day'>
                        <Form.Control 
                          size='sm'
                          controlid='day' 
                          className='mx-1' 
                          type='number'
                          maxLength={2} 
                          style={{width:'8ch'}} 
                          min={1} 
                          max={31} 
                          value={issuanceDate.day}
                          onInput={(e) => {if(e.target.value < 10) e.target.value = '0' + e.target.value}} 
                          onChange={(e)=>setIssuanceDate({year: issuanceDate.year, month: issuanceDate.month, day: e.target.value})}
                          />
                        </FloatingLabel>
                      </Form.Group>
                      </div>

                      {documentId &&
                        <div className="mb-3">
                          <Form.Label as='strong'>Connections</Form.Label>
                          <div className=' d-flex justify-content-between mt-2'>
                            <div className='col-8 text-start mx-3'>
                              {connections.length > 0 ? (
                                <ListGroup variant="flush" className="mb-2">
                                      {connections.map((conn, index) => (
                                        <ListGroup.Item key={index}>
                                              {conn.IdDocument1 == documentId ? `${documents.find((document) => document.IdDocument == conn.IdDocument2).Title} - ${typeConnections[conn.IdConnection].Type}` : `${documents.find((document) => document.IdDocument == conn.IdDocument1).Title} - ${typeConnections[conn.IdConnection].Type}`}
                                          </ListGroup.Item>
                                      ))}
                                  </ListGroup>
                              ) : (
                                <p className="text-muted">No connections added yet.</p>
                              )}
                            </div>
                            <div>
                              <Button variant="secondary" size='sm' className='rounded-pill' onClick={() => setShowAddConnection(true)}>
                                  Add Connection
                              </Button>
                            </div>
                          </div>
                        </div>}
                        <div className="mb-3">
                          <Form.Group controlId="formFileMultiple" className="mb-3">
                            <Form.Label as="strong">Original Resource</Form.Label>
                            
                            {/* List of resources */}
                            {resources.length > 0 ? (
                              <ListGroup variant="flush" className="mb-2">
                                <div style={{ overflowY: "auto",maxHeight : "150px"}}>
                                {resources.map((res, index) => (
                                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                  {/* Resource Link */}
                                  <a
                                    href={`http://localhost:3001${res.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'underline' }}
                                  >
                                    {res.filename}
                                  </a>
                                
                                  {/* Cancel/Delete Button */}
                                  <button
                                    type="button"
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => handleDeleteResource(res)} // Replace with your delete handler
                                    style={{ textDecoration: 'none' }}
                                  >
                                    ✖
                                  </button>
                                </ListGroup.Item>
                                ))}
                                </div>
                              </ListGroup>
                            ): (
                              <p className="text-muted">No resources added yet.</p>
                            )}
                            
                            {/* Form to upload new resources */}
                            <div className="d-flex mt-3 justify-content-between">
                              <Form.Control
                                type="file"
                                onChange={(e) => setAddResources(e.target.files)}
                                size="sm"
                                multiple
                              />
                            </div>
                          </Form.Group>
                        </div>
                </Col>

                {/* ---------------------- Right Column --------------------------- */}
                <Col md={6}>
                    <FormGroup controlid="stakeholder" className="mb-3">
                          <FloatingLabel  label="Stakeholder*" className="mb-3">
                            <Form.Select value={stakeholder.id} onChange={(e) => setStakeholder(e.target.value)}>
                              <option>Select Stakeholder</option>
                              {stakeholders.map((stk) => 
                                <option key={stk.id} value={stk.id}>{stk.name}</option>
                              )
                            }
                            </Form.Select>
                          </FloatingLabel>  
                        </FormGroup>
                        
                        <FormGroup controlid="type" className="mb-3">
                          <FloatingLabel label="Document Type*" className="mb-3">
                            <Form.Select value={type.id} onChange={(e) => setType(e.target.value)} >
                              <option>Select Document Type</option>
                              {types.map((tp) => 
                                <option key={tp.id} value={tp.id}>{tp.type}</option>
                              )
                            }
                            </Form.Select>
                          </FloatingLabel>  
                    </FormGroup>
                    <Form.Group controlid="description" className="mb-3">
                      <FloatingLabel label="Description*" className="mb-3">
                        <Form.Control
                            className='mt-auto'
                            as="textarea"
                            style={{height: '205px'}}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            />
                      </FloatingLabel>
                    </Form.Group>{(latitude && longitude) ? (
                            <div className='mb-4 d-flex'>
                              <p className='mx-4 d-flex align-items-center'>
                                <strong className='me-2'>Latitude:</strong> <Form.Control value={latitude} onChange={(e) => setLatitude(e.target.value)} maxLength={7}></Form.Control>
                              </p>
                              <p className='mx-4 d-flex align-items-center'>
                                <strong className='me-2'>Longitude:</strong> <Form.Control value={longitude} onChange={(e) => setLongitude(e.target.value)} maxLength={7}></Form.Control>
                              </p>
                            </div>
                          ) : (
                            <p>
                              <strong>Location: </strong> {documentId ? area : area.Area_Name}
                              </p>
                          )}
                </Col>
                      {message && <Alert variant="danger" dismissible onClick={() => setMessage('')}>{message}</Alert>}
            </Row>
            </Card.Body>
                    <div className="d-flex justify-content-center mb-4 mx-5">
                        <Button variant="outline-secondary" className='mx-2 rounded-pill px-4' onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button variant="" className='mx-2 btn-document rounded-pill px-4' onClick={handleUpdate}>
                            Save
                        </Button>
                    </div>
          </Card>





        {/* ----------------------- Modal for Adding a Connection ----------------------------- */}
        <Modal show={showAddConnection} centered onHide={() => setShowAddConnection(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Connection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlid="formDocument" style={{ position: 'relative' }}>
                    <Form.Label>Document</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search for a document"
                        value={selectedDocument.Title}
                        onChange={handleSearchChange}
                        autoComplete="off" // Prevents browser autocomplete
                    />
                    

                    {/* Render the dropdown list of suggestions */}
                    {filteredDocuments.length > 0 && (
                        <ListGroup style={{ position: 'absolute', top: '100%', zIndex: 1, width: '100%' }}>
                        {filteredDocuments.map((doc) => (
                            <ListGroup.Item
                            key={doc.IdDocument}
                            action
                            onClick={() => handleSelectDocument(doc)}
                            >
                            {doc.Title}
                            </ListGroup.Item>
                        ))}
                        </ListGroup>
                    )}
                </Form.Group>
                <Form.Group controlid="connectionTypeSelect" className="mb-3">
                    <Form.Label>Connection Type</Form.Label>
                    <Form.Select
                        value={connectionType}
                        onChange={(e) => setConnectionType(e.target.value)}
                    >
                        <option value="">Select connection type</option>
                        {Object.values(typeConnections).map((type) => (
                            <option key={type.IdConnection} value={type.IdConnection}>
                                {type.Type}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowAddConnection(false)}>
                    Cancel
                </Button>
                <Button variant="" className='btn-document' onClick={handleAddConnection}>
                    Add Connection
                </Button>
            </Modal.Footer>
        </Modal>
      {/* ----------------------- Modal for Adding a scale ----------------------------- */}
      <Modal show={showAddScale} centered onHide={() => setShowAddScale(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Scale</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form.Group controlid="scale" className="mb-3">
                          <FloatingLabel label="scale*" className="mb-3">
                            <Form.Control
                                type="text"
                                value={newScale_name}
                                onChange={(e) => setNewScale_name(e.target.value)}
                                />
                        </FloatingLabel>
                      </Form.Group>
                      
                      <Form.Group controlid="scale" className="mb-3">
                        <InputGroup>
                              <Form.Control
                                type="text"
                                placeholder="1:"
                                value="1:"
                                disabled
                                style={{ width: "15%", textAlign: "right" }}
                                className="mt-0 font-size-20"
                              />
                              <Form.Control
                                required
                                type="number"
                                placeholder="XXXX"
                                value={newScale_number ? newScale_number.split(":")[1] : ""}
                                onChange={(event) => handleNewScaleChange(event.target.value)}
                                className="mt-0 font-size-20"
                                style={{ width: "30%", textAlign: "left" }}
                              />
                        </InputGroup>
                      </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowAddScale(false)}>
                    Cancel
                </Button>
                <Button variant="" className='btn-document' onClick={handleAddScale}>
                    Add Scale
                </Button>
            </Modal.Footer>
        </Modal>
          
      </>    

      
    );
}

export default ModifyDocument;
