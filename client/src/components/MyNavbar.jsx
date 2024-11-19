import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Nav, ToggleButtonGroup, ToggleButton, Form, InputGroup, Modal, Card, FormGroup, FloatingLabel } from 'react-bootstrap';
import AppContext from '../AppContext';
import '../App.css'
import API from '../API';

export function MyNavbar({documents,setDocuments}) {
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
  const [stakeholder, setStakeholder] = useState();
  const [issuanceYear, setIssuanceYear] = useState('');


  const getStakeholders = async () => {
    try {
        const res = await API.getAllStakeholders();
        setStakeholders(res);
        setStakeholder(res[0].id);
    } catch (err) {
        console.error(err);
    }
  };
  useEffect(() => {
    getStakeholders();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Search term:", searchTerm); // for debugging
    if (searchTerm.trim() !== "" || stakeholder || issuanceYear) {
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

        //filter by stakeholder
        if(stakeholder){
          const filteredResultsStakeholder = filteredResults.filter((doc) => {
            return doc.IdStakeholder == stakeholder;
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

        setDocuments(filteredResults); // store the filtered results
        if(filteredResults.length === 1) {
          setSelectedDocument(filteredResults[0]);
        }
        else{
          setSelectedDocument(null);
        }
        console.log(`Search results for "${searchTerm}":`, filteredResults);

        // show modal after search results are fetched
        setShowModal(true);
    }
    else
    {
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
      <Navbar sticky='top' bg="light" variant="dark">
        <Container fluid>
          <Navbar.Brand>
            <div className="d-flex align-items-center">
              <Link onClick={() => navigate('/')} className="ms-3 mx-auto text-center main-color h1">Kiruna eXplorer</Link>
            </div>
          </Navbar.Brand>
          <Nav>
            {loginState.loggedIn && location.pathname === '/home' &&
              <div className=' d-flex justify-content-center mt-3'>
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
                </ToggleButtonGroup>
                {/* Search Bar */}
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
                    value={stakeholder}
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
            }
          </Nav>
          <Nav className=" d-flex justify-content-end">
            {loginState.loggedIn ? (
              <>
                <div className='me-4'>
                  <Navbar.Text style={{ color: 'black' }}>
                    <span>Signed in as: <strong>{loginState.user.name}</strong></span>
                    <br></br>
                    <span>Role: <strong>{loginState.user.role}</strong></span>
                  </Navbar.Text>
                </div>
                <div>
                  <Button className='mx-2 rounded-pill btn-logout' variant='' onClick={() => {
                    loginState.doLogout();
                    navigate('/');
                  }}>
                    {'Logout '}
                    <i className="bi bi-person-fill" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button className='mx-2 rounded-pill btn-main' variant='' onClick={() => navigate('/login')}>
                  {'Login '}
                  <i className="bi bi-person-fill" />
                </Button>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>


      Modal for Search Results 
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
