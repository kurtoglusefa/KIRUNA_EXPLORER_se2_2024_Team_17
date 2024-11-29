import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Nav, ToggleButtonGroup, ToggleButton, Form, InputGroup, Modal, Card, FormGroup, FloatingLabel, Badge, Breadcrumb } from 'react-bootstrap';
import AppContext from '../AppContext';
import '../App.css'
import '../WelcomePage.css'
import API from '../API';

export function MyNavbar({ documents, setDocuments }) {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const location = useLocation();
  const loginState = context.loginState;
  const setViewMode = context.viewMode.setViewMode;
  const viewMode = context.viewMode.viewMode;
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); //modal visibility
  const selectedDocument = useContext(AppContext).selectedDocument;
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [stakeholders, setStakeholders] = useState([]);
  const [typeDocuments, setTypeDocuments] = useState([]);
  const [stakeholder, setStakeholder] = useState();
  const [issuanceYear, setIssuanceYear] = useState('');
  const [typeDocument, setTypeDocument] = useState('');


  const getStakeholders = async () => {
    try {
      const res = await API.getAllStakeholders();
      setStakeholders(res);
      //setStakeholder(res[0].id);
    } catch (err) {
      console.error(err);
    }
  };
  const getAllTypeConnections = async () => {
    try {
      const res = await API.getAllTypesDocument();
      setTypeDocuments(res);
      //setStakeholder(res[0].id);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getStakeholders();
    getAllTypeConnections();
  }, []);
  

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Search term:", searchTerm); // for debugging
    if (searchTerm.trim() !== "" || stakeholder || issuanceYear || typeDocument) {
      const allDocuments = await API.getAllDocuments(); // fetch all documents
      console.log("Fetched documents:", allDocuments); // for debugging

      // filter documents safely
      let filteredResults = allDocuments.filter((doc) => {
        const title = doc?.Title || ""; // default to an empty string
        const description = doc?.Description || ""; // default to an empty string
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      console.log("Filtered results:", stakeholder); // for debugging
      //filter by stakeholder
      if (stakeholder) {
        const filteredResultsStakeholder = filteredResults.filter((doc) => {
          return doc.IdStakeholder  == stakeholder;
        });
        filteredResults = filteredResultsStakeholder;
      }
      if (issuanceYear) {
        console.log("Filtering by issuance year:", issuanceYear); // for debugging
        const filteredResultsYear = filteredResults.filter((doc) => {
          // Extract the year from IssuanceYear, assuming it's in a date format (e.g., '2024/04/31')
          const docYear = new Date(doc.Issuance_Date).getFullYear(); // Safely extract the year
          return docYear === parseInt(issuanceYear); // Compare with the input year
        });
        filteredResults = filteredResultsYear; // Update filtered results
      }
      console.log("Filtering by type of document:", typeDocument); // for debugging
      console.log("Filtered results:", typeDocument); // for debugging
      if(typeDocument) {
        console.log("Filtering by type of document:", typeDocument); // for debugging
        console.log("Filtered results:", filteredResults); // for debugging
        const filteredResultsType = filteredResults.filter((doc) => {
          return doc.IdType == typeDocument;
        });
        filteredResults = filteredResultsType;
      }

      setDocuments(filteredResults); // store the filtered results
      if (filteredResults.length === 1) {
        setSelectedDocument(filteredResults[0]);
      }
      else {
        setSelectedDocument(null);
      }
      console.log(`Search results for "${searchTerm}":`, filteredResults);

      // show modal after search results are fetched
      setShowModal(true);
    }
    else {
      const allDocuments = await API.getAllDocuments(); // fetch all documents
      setDocuments(allDocuments); // store the filtered results

    }
  };

  const handleCloseModal = () => setShowModal(false); // close modal


  const handleToggle = (value) => {
    setViewMode(value);
  };

  return (
    <>
      <Navbar sticky='top' bg="light" variant="dark" className='justify-content-between'>
          <Navbar.Brand href='/home'>
              <img
                src="/kiruna2.webp"
                alt="Kiruna eXplorer"
                style={{
                  width: '70px',
                  height: 'auto',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  //backgroundColor: '#A89559',
                  
                  cursor: 'pointer',
                  transition: 'background-color 0.3s, transform 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
          </Navbar.Brand>

          <Nav>
            {loginState.loggedIn && location.pathname === '/home' &&
              <div className=' d-flex justify-content-center align-items-center'>
                <ToggleButtonGroup
                  type="radio"
                  name="options"
                  value={viewMode}
                  onChange={handleToggle}
                >
                  <ToggleButton
                    id="tbg-map"
                    value="map"
                    variant="outline-primary"
                    className="px-4"
                    style={{
                      color: viewMode === "map" ? "white" : "#A89559",
                      borderColor: "#A89559",
                      backgroundColor: viewMode === "map" ? "#A89559" : "transparent",
                    }}
                  >
                    Map
                  </ToggleButton>
                  <ToggleButton
                    id="tbg-list"
                    value="list"
                    variant="outline-primary"
                    className="px-4"
                    style={{
                      color: viewMode === "list" ? "white" : "#A89559",
                      borderColor: "#A89559",
                      backgroundColor: viewMode === "list" ? "#A89559" : "transparent",
                    }}
                  >
                    List
                  </ToggleButton>
                  <ToggleButton
                    id="tbg-diagram"
                    value="diagram"
                    variant="outline-primary"
                    className="px-4"
                    style={{
                      color: viewMode === "diagram" ? "white" : "#A89559",
                      borderColor: "#A89559",
                      backgroundColor: viewMode === "diagram" ? "#A89559" : "transparent",
                    }}
                  >
                    Diagram
                  </ToggleButton>
                </ToggleButtonGroup>
                <div className='justify-content-end'>
                <Form className="d-flex align-items-center ms-3" onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search Doc"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-start me-3"
                      style={{
                        borderColor: '#A89559',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Form.Select
                      value={stakeholder || ""}
                      onChange={(e) => setStakeholder(e.target.value)}
                      style={{
                        borderColor: '#A89559',
                        width: '11ch',
                      }}
                      className="me-3"
                    >
                      <option value="">Select Stakeholder</option>
                      {stakeholders.map((stk) => (
                        <option key={stk.id} value={stk.id}>
                          {stk.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Select
                      value={typeDocument || ""}
                      onChange={(e) => setTypeDocument(e.target.value)}
                      style={{
                        borderColor: '#A89559',
                        width: '11ch',
                      }}
                      className="me-3"
                    >
                      <option value="">Select Type of document</option>
                      {typeDocuments.map((typo) => (
                        <option key={typo.id} value={typo.id}>
                          {typo.type}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control
                      type="number"
                      placeholder="YYYY"
                      value={issuanceYear}
                      onChange={(e) => setIssuanceYear(e.target.value)}
                      className="rounded-0 me-3"
                      style={{
                        borderColor: '#A89559',
                        maxWidth: '9ch',
                      }}
                      min={2000}
                      max={2024}
                    />
                    <Button
                      variant="outline-primary"
                      type="submit"
                      className="rounded-end"
                      style={{
                        backgroundColor: '#A89559',
                        color: 'white',
                        borderColor: '#A89559',
                      }}
                    >
                      <i className="bi bi-search" />
                    </Button>
                  </InputGroup>
                </Form>
                </div>
              </div>
            }
          </Nav>
          <Nav className=" d-flex justify-content-end">
            {loginState.loggedIn ? (
              <>
                <div className='d-flex align-items-center'>
                  <Badge bg='light' className='mx-2' style={{ color: 'black', fontSize:'14px' }}>
                    <span>Signed in as: <strong>{loginState.user.name}</strong></span>
                    <br></br>
                    <span>Role: <strong>{loginState.user.role}</strong></span>
                  </Badge>
                </div>
                <div className='d-flex align-items-center'>
                  <Button size='md' className='px-3 rounded-pill btn-logout' variant='' onClick={() => {
                    loginState.doLogout();
                    navigate('/');
                  }}>
                    {'Logout '}
                    <i className="bi bi-person-fill" />
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <Button size='md' className='px-3 rounded-pill btn-main' variant='' href='/login'>
                  {'Login '}
                  <i className="bi bi-person-fill" />
                </Button>
              </div>
            )}
          </Nav>
      </Navbar>


      {/* Modal for Search Results */}
      {/* <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Search Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {searchResults.length > 0 ? (
            <div className="row">
              {searchResults.map((doc) => (
                <div className="col-md-12 mb-3" key={doc.IdDocument}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{doc.Title}</Card.Title>
                      <Card.Text>{doc.Description || 'No description available'}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <p>No results found for "{searchTerm}".</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      */}
    </>


  );
}
export default MyNavbar;
