import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Form,
  Card,
  Row,
  Col,
  Modal,
  ListGroup,
  FloatingLabel,
  FormGroup,
  Alert,
  InputGroup,
  CloseButton,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

import API from "../API";
function ModifyDocument() {
  let { documentId } = useParams();
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const selectedLocation = location.state.location || {};

  console.log("selected location");
  console.log(selectedLocation);


  // document fields
  const [title, setTitle] = useState("");
  const [scale, setScale] = useState("");
  const [issuanceDate, setIssuanceDate] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [pages, setPages] = useState("");
  const [stakeholder, setStakeholder] = useState([]);
  const [type, setType] = useState("");
  const [latitude, setLatitude] = useState(
    selectedLocation.lat ? selectedLocation.lat : ""
  );
  const [longitude, setLongitude] = useState(
    selectedLocation.lng ? selectedLocation.lng : ""
  );
  const [area, setArea] = useState(
    location.state.area ? location.state.area : null
  );
  const [resources, setResources] = useState([]);
  const [addResources, setAddResources] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [connections, setConnections] = useState([]); // List of added connections
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [stakeholders, setStakeholders] = useState([]);
  const [types, setTypes] = useState([]);
  const [typeConnections, setTypeConnections] = useState([]);
  const [documentScale, setDocumentScale] = useState("");

  const [documents, setDocuments] = useState([]); // List of all documents
  const [filteredDocuments, setFilteredDocuments] = useState([]); // used to filter documents
  const [locationsArea, setLocationsArea] = useState([]);

  const [showAddScale, setShowAddScale] = useState(false);
  const [scales, setScales] = useState([]);
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);
  const [showAddDocumentType, setShowAddDocumentType] = useState(false);

  //adding new scale
  const [newScale_name, setNewScale_name] = useState("");
  const [newScale_number, setNewScale_number] = useState("");
  const [newStakeholder_name, setNewStakeholder_name] = useState("");
  const [oldScale_number, setOldScale_number] = useState("");

  //adding new document type
  const [newDocumentType_name, setNewDocumentType_name] = useState("");

  const [selectedStakeholders, setSelectedStakeholders] = useState([]);

  const [locationType, setLocationType] = useState(selectedLocation.type);
  const [selectedArea, setSelectedArea] = useState(selectedLocation.area);
  const [loading, setLoading] = useState(false);


  console.log("selected loc");
  console.log(selectedLocation.type);
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await API.getDocumentResources(documentId);
        setResources(res);
      } catch (err) {
        if (err.response.status === 404) {
          setResources([]);
        } else {
          setMessage("Error fetching resources");
        }
      }
    };
    const fetchStakeholdersbyDocumentId = async (id) => {
      try {
        const res = await API.getStakeholderByDocumentId(id);
        console.log(res);
        setSelectedStakeholders(
          res.map((stk) => ({ value: stk.IdStakeholder, label: stk.Name }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    if (documentId) {
      fetchStakeholdersbyDocumentId(documentId);
      fetchResources();
    }
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
    };
    const getTypes = async () => {
      try {
        const res = await API.getAllTypesDocument();
        setTypes(res);
        setType(res[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchDocuments = async () => {
      try {
        const res = await API.getAllDocuments();
        setDocuments(res);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchLocationsArea = async () => {
  
      API.getAllLocationsArea()
        .then((res) => {
  
          const locationsById = res.reduce((acc, location) => {
            acc[location.IdLocation] = location;
            return acc;
          }, {});
          // Set the transformed object to state
          setLocationsArea(locationsById);
        })
        .catch((err) => {
          console.error(err);
        });
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
          year: res.Issuance_Date.substring(0, 4)
            ? res.Issuance_Date.substring(0, 4)
            : null,
          month: res.Issuance_Date.substring(5, 7)
            ? res.Issuance_Date.substring(5, 7)
            : null,
          day: res.Issuance_Date.substring(8, 10)
            ? res.Issuance_Date.substring(8, 10)
            : null,
        });
        setDescription(res.Description);
        const scalesResponse = await API.getScales();
        setScales(scalesResponse);
        const scaleObj = scalesResponse.find((s) => s.id === res.IdScale);
        setDocumentScale(scaleObj);
        setOldScale_number(scaleObj.scale_number.split(":")[1]);

        /*const stakeholder = await API.getStakeholder(res.IdStakeholder);
                setStakeholder(stakeholder);*/ //multiple stakeholders
        const type = await API.getTypeDocument(res.IdType);
        setType(type);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
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
    setLoading(true);
    fetchLocationsArea();
    getAllScales();
    fetchDocuments();
    getStakeholders();
    getTypes();
    getAllTypeConnections();
    getDocumentConnections();
    if (documentId) fetchDocument();
  }, []);

  const handleDeleteResource = async (resource) => {
    try {
      console.log(resource);
      await API.deleteResource(resource);
      const res = await API.getDocumentResources(documentId);
      setResources(res);
    } catch (err) {
      setMessage("Error deleting resource");
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

  const handleAddScale = async () => {
    //here call api to add a scale
    await API.addScale(newScale_name, newScale_number);
    const res = await API.getScales();
    setScales(res);
    setNewScale_name("");
    setNewScale_number("");
    setShowAddScale(false);
  };

  const handleAddDocumentType = async () => {
    // here call api to add a document type
    console.log(newDocumentType_name);
    await API.createTypeDocument(newDocumentType_name,' ');
    const res = await API.getAllTypesDocument();
    setTypes(res);
    setNewDocumentType_name("");
    setShowAddDocumentType(false);
  };
  const addResourcesDocument = async () => {
    if (addResources.length > 0) {
      try {
        // Send FormData to your API function
        await API.addResourcesToDocument(documentId, addResources);
        // Optionally, fetch the updated resources list
        const res = await API.getDocumentResources(documentId);
        setAddResources([]);
        setMessage("");
      } catch (err) {
        setMessage("Error uploading resources:" + err);
      }
    } else {
      setMessage("No files selected");
    }
  };

  const handleUpdate = async () => {
    console.log("sto aggiornando");
    if (
      !title ||
      !documentScale ||
      !issuanceDate.year ||
      !description ||
      !selectedStakeholders ||
      !type
    ) {
      setMessage("Please complete all fields to add a document.");
    } else {
      let date;
      if (issuanceDate.year && issuanceDate.month && issuanceDate.day) {
        date = `${issuanceDate.year}/${issuanceDate.month}/${issuanceDate.day}`;
      } else if (issuanceDate.year && issuanceDate.month && !issuanceDate.day) {
        date = `${issuanceDate.year}/${issuanceDate.month}`;
      } else if (
        issuanceDate.year &&
        !issuanceDate.month &&
        !issuanceDate.day
      ) {
        date = `${issuanceDate.year}`;
      } else {
        setMessage("Please provide a valid date format.");
        return;
      }
      if (documentScale && documentScale.id > 3) {
        await API.updateScale(documentScale.id, `1:${oldScale_number}`);
      }
      if (documentId) {
        await API.updateDocument(
          documentId,
          title,
          selectedStakeholders.map((stk) => stk.value),
          documentScale.id,
          date,
          language,
          pages,
          description,
          type.id ? type.id : type
        );
        if (locationType === "Point") {
          await API.updateLocationDocument(
            document.IdLocation,
            "Point",
            latitude,
            longitude,
            ""
          );
        }
        else{
          // update the document with the new chosen area
          await API.updateLocationDocument(document.IdDocument,selectedArea.IdLocation); //TODO check if it works
        }
    } else {
        console.log("sto inserendo");
        console.log(selectedStakeholders);
        console.log(selectedLocation);
        if ( locationType === "Point" && latitude && longitude) {
          // insert the document which is a point
          //check to be here the type of the document BEACYSE MUST BE NOT NULL
          let result = await API.addDocument(
            title,
            selectedStakeholders.map((stk) => stk.value),
            documentScale.id,
            date,
            language,
            pages,
            description,
            type,
            "Point",
            latitude,
            longitude,
            ""
          );
          //console.log(result);
          result = await result.idDocument;
          documentId = result;
        } else{
          //insert the document inside an area

          console.log("sto inserendo un documento in un area");
          let result = await API.addDocumentArea(
            title,
            selectedStakeholders.map((stk) => stk.value),
            documentScale.id,
            date,
            language,
            pages,
            description,
            type,
            selectedArea.IdLocation
          );
          console.log(result);
          result = await result.idDocument;
          documentId = result;
        }
      }

      if (addResources) {
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

  const handleAddConnection = async () => {
    if (selectedDocument && connectionType) {
      await API.createDocumentConnection(
        documentId,
        selectedDocument.IdDocument,
        connectionType
      );
      // now i have to call again the document to update the connections
      const res = await API.getDocumentConnection(documentId);
      setConnections(res);
      setSelectedDocument("");
      setConnectionType("");
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
      const filtered = documents.filter(
        (doc) =>
          doc.Title.toLowerCase().includes(searchValue.toLowerCase()) &&
          doc.IdDocument != documentId
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
  const handleAddStakeholder = async () => {
    //here call api to add a scale
    console.log(newStakeholder_name);
    await API.addStakeholder(newStakeholder_name);
    // after we insert the stakeholder we have to update the list of stakeholders
    const res = await API.getAllStakeholders();
    setStakeholders(res);
    setNewStakeholder_name("");
    setShowAddStakeholder(false);
  };

  const handleOptionChangeLocation = (e) => {
    setLocationType(e.target.value);
  };
  /* ------------------------------------ FORM ------------------------------------------ */
  return (
    <>

      <Card className="container bg-light rounded form" style={{marginTop:'140px', minHeight:'680px'}}>
        <Card.Title>
          <h3 className="text-center mt-4">
            {documentId ? "Update" : "Create"} Document
          </h3>
        </Card.Title>
        <Card.Body>
        { loading ? (
          <Spinner animation="border" role="status" style={{marginTop:'50px'}} />
        ) : (
          <Row>
            {/* ---------------------- Left Column --------------------------- */}
            <Col md={6}>
              <Form.Group controlid="title" className="mb-2 text-start">
              <Form.Label as="strong">Title*</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlid="scale" className="mb-2 text-start">
                <Form.Label as="strong">Scale*</Form.Label>
                <InputGroup>
                  <Form.Select
                    required
                    value={documentScale ? documentScale.id : 0}
                    style={{ width: "20%" }}
                    onChange={(event) =>
                      handleTypeScaleChange(event.target.value)
                    }
                    className="font-size-20"
                  >
                    <option value="0">Select scale</option>
                    {scales &&
                      scales.map((scale) => (
                        <option key={scale.id} value={scale.id}>
                          {scale.scale_text}
                        </option>
                      ))}
                  </Form.Select>
                  {documentScale && documentScale.id > 3 && (
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
                                style={{ textAlign: "left" }}
                              />
                            </>
                          )}
                          <Button
                          variant="outline-secondary"
                          onClick={()=> setShowAddScale(true)}
                          style={{ textAlign: "left" }}
                          
                        >
                          Add New Scale
                        </Button>
                        </InputGroup>
                      </Form.Group>
                      
                      <Form.Group controlid="language" className="mb-2 text-start">
                      <Form.Label as="strong">Language</Form.Label>
                          <Form.Select
                              placeholder='language'
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                            >
                              <option>Select Language</option>
                              <option value="English">English</option>
                              <option value="Swedish">Swedish</option>
                          </Form.Select>
                      </Form.Group>
                      
                      <div className='d-flex justify-content-between mb-2'>
                        <Form.Group controlid="pages" className='col-3 d-flex align-items-center'>
                        <strong className="me-3">Pages</strong>
                        <Form.Control
                              defaultValue={0}
                              type="number"
                              className="text-end"
                              value={pages}
                              onChange={(e) => setPages(e.target.value)}
                              min={0}
                              />
                        </Form.Group>
                        <Form.Group controlid="issuanceDate" className="d-flex align-items-center">
                          <strong className="me-3">Issuance Date</strong>
                          <Form.Control
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
                          /
                          <Form.Control
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
                          /
                          <Form.Control
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
                        </Form.Group>
                      </div>

              {documentId && (
                <div className="mb-2 text-start">
                  <Form.Label as="strong" className="text-start">Connections: </Form.Label>{connections.length}
                  <div className=" d-flex justify-content-between mt-1">
                    <div className="col-7 text-start me-3">
                      {connections.length > 0 ? (
                        <ListGroup variant="flush" className="mb-2" style={{ fontSize:'12px',maxHeight:'100px', overflowY:'auto'}}>
                          {connections.map((conn, index) => (
                            <ListGroup.Item key={index}>
                              {conn.IdDocument1 == documentId
                                ? `${
                                    documents.find(
                                      (document) =>
                                        document.IdDocument == conn.IdDocument2
                                    ).Title
                                  } - ${
                                    typeConnections[conn.IdConnection].Type
                                  }`
                                : `${
                                    documents.find(
                                      (document) =>
                                        document.IdDocument == conn.IdDocument1
                                    ).Title
                                  } - ${
                                    typeConnections[conn.IdConnection].Type
                                  }`}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p className="text-muted text-center">No connections added yet.</p>
                      )}
                    </div>
                    <div className="text-center me-5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setShowAddConnection(true)}
                      >
                        Add Connection
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-start">
                <Form.Group controlId="formFileMultiple" className="mb-2">
                  <Form.Label as="strong">Original Resources: </Form.Label>{resources.length}
                  <div className="d-flex">
                    <div className="col-7 me-2">
                    {/* List of resources */}
                    {resources.length > 0 ? (
                      <ListGroup variant="flush" className="mb-2">
                        <div style={{ overflowY: "auto", maxHeight: "100px", fontSize:'12px' }}>
                          {resources.map((res, index) => (
                            <ListGroup.Item
                            key={index}
                              className="d-flex justify-content-between align-items-center"
                              >
                              {/* Resource Link */}
                              <a
                                href={`http://localhost:3001${res.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "underline" }}
                                >
                                {res.filename}
                              </a>

                              {/* Cancel/Delete Button */}
                              <CloseButton onClick={() => handleDeleteResource(res)}></CloseButton>
                            </ListGroup.Item>
                          ))}
                        </div>
                      </ListGroup>
                    ) : (
                      <p className="text-muted text-center">No resources added yet.</p>
                    )}
                    </div>
                    <div className="col">
                      {/* Form to upload new resources */}
                      <Form.Control
                        type="file"
                        onChange={(e) => setAddResources(e.target.files)}
                        size="sm"
                        multiple
                        />
                    </div>  
                  </div>
                </Form.Group>
              </div>
            </Col>

            {/* ---------------------- Right Column --------------------------- */}
            <Col className="text-start" md={6}>
              <FormGroup
                controlId="stakeholder"
                className="mb-3"
              >
              <Form.Label as="strong">Stakeholders*</Form.Label>
                <InputGroup className="align-items-center">
                  <Select
                    options={stakeholders.map((stk) => ({
                      value: stk.id,
                      label: stk.name,
                    }))}
                    isMulti
                    placeholder="Select Stakeholder"
                    value={selectedStakeholders}
                    onChange={(selected) => setSelectedStakeholders(selected)}
                    className="col-9"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowAddStakeholder(true)}
                    className="rounded-end col"
                  >
                    Add Stakeholder
                  </Button>
                </InputGroup>
              </FormGroup>
                <FormGroup controlid="type" className="mb-3">
                  <Form.Label as="strong">Document Type*</Form.Label>
                  <InputGroup className="align-items-center">
                    <Form.Select
                      value={type.id}
                      onChange={(e) => setType(e.target.value)}
                      className="col-8"
                    >
                      <option>Select Document Type</option>
                      {types.map((tp) => (
                        <option key={tp.id} value={tp.id}>
                          {tp.type}
                        </option>
                      ))}
                    </Form.Select>

                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowAddDocumentType(true)}
                    >
                      Add Document Type
                    </Button>
                  </InputGroup>
                </FormGroup>
                <Form.Group controlid="description" className="mb-3">
                  <Form.Label as="strong">Description*</Form.Label>
                  <Form.Control
                    className="mt-auto"
                    as="textarea"
                    style={{ height: "150px" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlid="location" className="mb-5 d-flex justify-content-between">
                  <div  className="ms-3">
                    <Form.Label as="strong" className="">Type Location</Form.Label>
                    <div className="ms-3 mt-2">
                      <Form.Check
                        type="radio"
                        label="Area"
                        name="options"
                        id="optionArea"
                        value="Area"
                        checked={locationType === "Area"}
                        onChange={handleOptionChangeLocation}
                      />
                      <Form.Check
                        type="radio"
                        label="Point"
                        name="options"
                        id="optionPoint"
                        value="Point"
                        checked={locationType === "Point"}
                        onChange={handleOptionChangeLocation}
                      />
                    </div>
                  </div>

                      

                  <div className="mt-4">
                    {locationType === "Point" ? (
                      <>
                        <div className="d-flex justify-content-between col-9">
                          <Form.Label as='strong'>
                            Latitude
                          </Form.Label>
                          <div className="col-6 text-end">
                            <Form.Control
                              id="latitude"
                              value={latitude}
                              onChange={(e) => setLatitude(e.target.value)}
                              maxLength={7}
                              className="ms-2"
                              size="sm"
                              />
                          </div>
                        </div>
                        <div className="d-flex justify-content-between col-9">
                          <Form.Label as='strong'>
                            Longitude
                          </Form.Label>
                          <div className="col-6 text-end">
                          <Form.Control
                            id="longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            maxLength={7}
                            size="sm"
                            className="ms-2"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex align-items-center me-5">
                          <Form.Label as='strong' className="mt-1 me-3">
                            Area
                          </Form.Label>
                          <Form.Select
                            value={selectedArea ? selectedArea.IdLocation : ""}
                            onChange={(e) => {
                              const area = locationsArea[e.target.value];
                              setSelectedArea(area);
                            }}
                            size="sm"
                            required={true}
                            >
                            <option>Select an Area</option>
                            {Object.values(locationsArea).map((area) => (
                              <option
                              key={area.IdLocation}
                              value={area.IdLocation}
                              >
                                {area.Area_Name || `Area ${area.IdLocation}`}
                              </option>
                            ))}
                          </Form.Select>
                      </div>
                    )}
                  </div>
                </Form.Group>
              
        <div className="d-flex justify-content-center mb-4 mx-5">
          <Button
            variant="outline-secondary"
            className="mx-2 rounded-pill px-4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            variant=""
            className="mx-2 btn-document rounded-pill px-4"
            onClick={handleUpdate}
          >
            Save
          </Button>
        </div>
            </Col>
            {message && (
              <Alert
                variant="danger"
                dismissible
                onClick={() => setMessage("")}
              >
                {message}
              </Alert>
            )}
          </Row>
      ) }
        </Card.Body>
      </Card>

      {/* ----------------------- Modal for Adding a Connection ----------------------------- */}
      <Modal
        show={showAddConnection}
        centered
        onHide={() => setShowAddConnection(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Connection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlid="formDocument" style={{ position: "relative" }}>
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
              <ListGroup
                style={{
                  position: "absolute",
                  top: "100%",
                  zIndex: 1,
                  width: "100%",
                }}
              >
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
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddConnection(false)}
          >
            Cancel
          </Button>
          <Button
            variant=""
            className="btn-document"
            onClick={handleAddConnection}
          >
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
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddScale(false)}
          >
            Cancel
          </Button>
          <Button variant="" className="btn-document" onClick={handleAddScale}>
            Add Scale
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ----------------------- Modal for Adding a stakeholder ----------------------------- */}
      <Modal
        show={showAddStakeholder}
        centered
        onHide={() => setShowAddStakeholder(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Stakeholder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlid="stakeholder" className="mb-3">
            <FloatingLabel label="Stakeholder name*" className="mb-3">
              <Form.Control
                type="text"
                value={newStakeholder_name}
                onChange={(e) => setNewStakeholder_name(e.target.value)}
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddStakeholder(false)}
          >
            Cancel
          </Button>
          <Button
            variant=""
            className="btn-document"
            onClick={handleAddStakeholder}
          >
            Add StakeHolder
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ----------------------- Modal for Adding a document type ----------------------------- */}
      <Modal
        show={showAddDocumentType}
        centered
        onHide={() => setShowAddDocumentType(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Document Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlid="Document type" className="mb-3">
            <FloatingLabel label="Document type name*" className="mb-3">
              <Form.Control
                type="text"
                value={newDocumentType_name}
                onChange={(e) => setNewDocumentType_name(e.target.value)}
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddDocumentType(false)}
          >
            Cancel
          </Button>
          <Button
            variant=""
            className="btn-document"
            onClick={handleAddDocumentType}
          >
            Add Document Type
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModifyDocument;
