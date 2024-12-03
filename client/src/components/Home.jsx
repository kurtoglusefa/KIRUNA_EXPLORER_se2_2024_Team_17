import { useState, useEffect, useContext } from 'react';
import MapComponent from './Map';
import { Button, ToggleButtonGroup, ToggleButton, ListGroup, Spinner, Card, Row, Col, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa'; // Import document icon
import API from '../API'; // Import API module
import { Form } from 'react-bootstrap';
import AppContext from '../AppContext';
import '../App.css';
import { Modal } from 'react-bootstrap';
import CardDocument from './CardDocument';
import Diagram from './Diagram';
import SidebarLegend from './SidebarLegend';



function Home(props) {
  const viewMode = useContext(AppContext).viewMode.viewMode;
  const [loading, setLoading] = useState(true);
  const selectedDocument = useContext(AppContext).selectedDocument;
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [stakeholders, setStakeholders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationsArea, setLocationsArea] = useState([]);
  const [numberofconnections, setNumberofconnections] = useState(0);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [srcicon, setSrcicon] = useState("");
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [connectionType, setConnectionType] = useState('');
  const [typeConnections, setTypeConnections] = useState({});
  const [selectDocumentSearch, setSelectDocumentSearch] = useState('');



  const context = useContext(AppContext);
  const isLogged = context.loginState.loggedIn;
  const fetchDocuments = async () => {
    try {
      const documents  = await API.getAllDocuments();
      const updatedDocuments = await Promise.all(
        documents.map(async (doc) => {
          const stakeholders = await API.getStakeholderByDocumentId(doc.IdDocument);
          return { ...doc, IdStakeholder: stakeholders };
        })
      );
      // Update state with documents containing stakeholders
      props.setDocuments(updatedDocuments);

    } catch (err) {
      console.error(err);
    }
  };
  const fetchDocumentTypes = async () => {
    try {
      const res = await API.getAllTypesDocument();
      //console.log('Document Types:', res);

      setDocumentTypes(res);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchLocations = async () => {
    setLoading(true);
    API.getAllLocations()
      .then((res) => {
        // Convert the array into an object with IdLocation as the key
        const locationsById = res.reduce((acc, location) => {
          acc[location.IdLocation] = location;
          return acc;
        }, {});
        // Set the transformed object to state
        setLocations(locationsById);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };
  const fetchLocationsArea = async () => {
    setLoading(true);

    API.getAllLocationsArea()
      .then((res) => {

        const locationsById = res.reduce((acc, location) => {
          acc[location.IdLocation] = location;
          return acc;
        }, {});
        // Set the transformed object to state
        setLocationsArea(locationsById);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };
  const getAllTypeConnections = async () => {
    try {
      const res = await API.getAllTypeConnections();

      const typeConnectionId = res.reduce((acc, conn) => {
        acc[conn.IdConnection] = conn;
        return acc;
      }, {});
      setTypeConnections(typeConnectionId);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStakeholders = async () => {
    try {
      const res = await API.getAllStakeholders();
      setStakeholders(res);
    } catch (err) {
      console.error(err);
    }
  };
  // get all documents, locations and stakeholders
  useEffect(() => {
    Promise.all([fetchDocuments(), fetchLocations(), fetchStakeholders(), fetchDocumentTypes(), getAllTypeConnections(), fetchLocationsArea()])
      .then(() => setLoading(false))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDocumentClick = async (doc) => {
    // Fetch the number of connections for the selected document
    const res = await API.getDocumentConnection(doc.IdDocument);
    setNumberofconnections(res.length);
    setSelectedDocument(doc);
    setSrcicon("src/icon/" + documentTypes[doc.IdType].iconsrc);

  };

  const handleAddConnection = async () => {
    if (selectedDocument && connectionType) {
      await API.createDocumentConnection(selectedDocument.IdDocument, selectDocumentSearch.IdDocument, connectionType);
      // now i have to call again the document to update the connections
      const res = await API.getDocumentConnection(selectedDocument.IdDocument);
      setSelectedDocument('');
      setConnectionType('');
      setShowAddConnection(false);
    } else {
      alert("Please complete all fields to add a connection.");
    }
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSelectDocumentSearch(searchValue);

    // Filter documents that match the input
    if (searchValue.length > 0) {
      const filtered = props.documents.filter((doc) =>
        doc.Title.toLowerCase().includes(searchValue.toLowerCase()) && doc.IdDocument != selectedDocument.IdDocument
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments([]);
    }
  };
  const handleSelectionDocument = (doc) => {
    setSelectDocumentSearch(doc);
    setFilteredDocuments([]);
  }
  const closeModal = () => {
    setShowAddConnection(false);
    selectDocumentSearch('');
  }

  return (
    <>
      <div className='justify-content-center' style={{ paddingTop: '80px' }} >
        {viewMode === 'map' && (
          loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <MapComponent locations={locations} setLocations={setLocations} locationsArea={locationsArea} documents={props.documents} setSelectedLocation={setSelectedLocation} setSelectedDocument={setSelectedDocument} selectedLocation={selectedLocation} handleDocumentClick={handleDocumentClick} numberofconnections={numberofconnections} fetchLocationsArea={fetchLocationsArea} />
          )

        )}
        {viewMode === 'list' && (
          loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <>
              <Card className="mt-5 mx-5" style={{ minHeight: '400px' }}>
                <div className='d-flex p-3'>
                  <div className='me-3 col-md-4 col-sm-3' style={{ maxHeight: '600px' }}>
                    {loading ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <Card style={{ width: '100%' }}>
                        <Card.Header>Document List</Card.Header>
                        <ListGroup style={{ maxHeight: '355px', overflowY: 'auto' }}>
                          {props.documents.map((doc, index) => (
                            <ListGroup.Item
                              key={index}
                              onClick={() => handleDocumentClick(doc)}
                              style={{ cursor: 'pointer', fontWeight: selectedDocument === doc ? 'bold' : 'normal' }}
                            >
                              {doc.Title}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    {selectedDocument!=null ? (
                      <CardDocument
                        document={selectedDocument}
                        locationType={locationsArea[selectedDocument?.IdLocation] ? "Area" : "Point"}
                        latitude={locations[selectedDocument?.IdLocation]?.Latitude.toFixed(4)}
                        longitude={locations[selectedDocument?.IdLocation]?.Longitude.toFixed(4)}
                        setSelectedDocument={setSelectedDocument}
                        isLogged={isLogged}
                        viewMode={viewMode}
                        numberofconnections={numberofconnections}
                        area={locationsArea[selectedDocument?.IdLocation]}
                        stakeholders={stakeholders}
                      />
                    ) : (
                      <div className="text-muted">Select a document to view its specifications.</div>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )
        )}
        {viewMode === 'diagram' ? ( 
          loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <div>
                <Diagram locations={locations} setLocations={setLocations} locationsArea={locationsArea} documents={props.documents} setDocuments={props.setDocuments} selectedDocument={selectedDocument} setSelectedDocument={setSelectedDocument} />
              </div>
            )
          ) : null
        }
        
        <SidebarLegend loggedIn={isLogged}/>
      </div>

      <Modal show={showAddConnection} centered onHide={() => setShowAddConnection(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Connection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formDocument" style={{ position: 'relative' }}>
            <Form.Label>Document</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter document name"
              value={selectDocumentSearch?.Title || ""}
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
                    onClick={() => handleSelectionDocument(doc)}
                  >
                    {doc.Title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
          <Form.Group controlId="connectionTypeSelect" className="mb-3">
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
          <Button variant="outline-secondary" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddConnection}>
            Add Connection
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
}

export default Home;
