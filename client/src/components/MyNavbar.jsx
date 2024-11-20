import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Nav, ToggleButtonGroup, ToggleButton, Form, InputGroup, Modal, Card } from 'react-bootstrap';
import AppContext from '../AppContext';
import '../App.css'
import API from '../API';

export function MyNavbar() {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const location = useLocation();
  const loginState = context.loginState;
  const setViewMode = context.viewMode.setViewMode;
  const viewMode = context.viewMode.viewMode;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // to store fetched results
  const [showModal, setShowModal] = useState(false); //modal visibility



  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      try {
        const allDocuments = await API.getAllDocuments(); // fetch all documents
        console.log("Fetched documents:", allDocuments); // for debugging

        // filter documents safely
        const filteredResults = allDocuments.filter((doc) => {
          const title = doc?.Title || ""; // default to an empty string
          const description = doc?.Description || ""; // default to an empty string
          return (
            title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

        setSearchResults(filteredResults); // store the filtered results
        console.log(`Search results for "${searchTerm}":`, filteredResults);

        // show modal after search results are fetched
        setShowModal(true);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
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
                <InputGroup className="ms-3">
                  <Form.Control
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-pill"
                    style={{
                      borderColor: "#A89559",
                      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={handleSearch}
                    className="rounded-pill ms-2"
                    style={{
                      backgroundColor: "#A89559",
                      color: "white",
                      borderColor: "#A89559",
                    }}
                  >
                    <i className="bi bi-search" />
                  </Button>
                </InputGroup>
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


      {/* Modal for Search Results */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
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
    </>


  );
}
export default MyNavbar;
