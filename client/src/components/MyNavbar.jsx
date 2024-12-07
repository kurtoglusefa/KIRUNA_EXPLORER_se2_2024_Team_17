import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, ToggleButtonGroup, ToggleButton, Form, InputGroup, Card, Badge, Collapse } from 'react-bootstrap';
import AppContext from '../AppContext';
import '../App.css'
import '../WelcomePage.css'
import API from '../API';
import PropTypes from 'prop-types';

function MyNavbar({ documents, setDocuments }) {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const location = useLocation();
  const loginState = context.loginState;
  const setViewMode = context.viewMode.setViewMode;
  const viewMode = context.viewMode.viewMode;
  const [searchTerm, setSearchTerm] = useState("");
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [stakeholders, setStakeholders] = useState([]);
  const [typeDocuments, setTypeDocuments] = useState([]);
  const [stakeholder, setStakeholder] = useState();
  const [issuanceYear, setIssuanceYear] = useState('');
  const [typeDocument, setTypeDocument] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  const getStakeholders = async () => {
    try {
      const res = await API.getAllStakeholders();
      setStakeholders(res);
    } catch (err) {
      console.error(err);
    }
  };
  const getAllTypeConnections = async () => {
    try {
      const res = await API.getAllTypesDocument();
      setTypeDocuments(res);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchStakeholdersbyDocumentId = async (id) => {
    try {
      const res = await API.getStakeholderByDocumentId(id);
      return res;
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
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      console.log("Filtered results:", stakeholder); // for debugging
      //filter by stakeholder
      if (stakeholder) {
        const filteredResultsStakeholder = await Promise.all(
          filteredResults.map(async (doc) => {
            const stakeholders = await fetchStakeholdersbyDocumentId(doc.IdDocument);
            console.log("Stakeholders:", stakeholders); // for debugging
            if (stakeholders.some((stk) => stk.IdStakeholder == stakeholder)) {
              return doc;
            }
            return null;
          })
        );
        filteredResults = filteredResultsStakeholder.filter((doc) => doc !== null);
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
      if(typeDocument) {
        console.log("Filtering by type of document:", typeDocument); // for debugging
        console.log("Filtered results:", filteredResults); // for debugging
        const filteredResultsType = filteredResults.filter((doc) => {
          return doc.IdType == typeDocument;
        });
        filteredResults = filteredResultsType;
      }
      filteredResults= await Promise.all(
        filteredResults.map(async (doc) => {
          const stakeholders = await API.getStakeholderByDocumentId(doc.IdDocument);
          return { ...doc, IdStakeholder: stakeholders };
        })
      );
      console.log("Filtered results:", filteredResults); // for debugging
      setDocuments(filteredResults); // store the filtered results
      if (filteredResults.length === 1) {
        setSelectedDocument(filteredResults[0]);
      }
      else {
        setSelectedDocument(null);
      }
      console.log("documents:",filteredResults); // for debugging
      console.log(`Search results for "${searchTerm}":`, filteredResults);

    }
    else {
      const allDocuments = await API.getAllDocuments(); // fetch all documents
      let filteredResults= await Promise.all(
        allDocuments.map(async (doc) => {
          const stakeholders = await API.getStakeholderByDocumentId(doc.IdDocument);
          return { ...doc, IdStakeholder: stakeholders };
        })
      );
      setDocuments(filteredResults); // store the filtered results
    }
  };
  const handleToggle = (value) => {
    setViewMode(value);
  };

  return (
    <>
      <Navbar sticky='top' bg="light" variant="dark" className='justify-content-between'>
          <Navbar.Brand href='/'>
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

            {location.pathname === '/home' &&
            
              <Nav>
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
              </Nav>
            }
            {loginState.loggedIn && location.pathname === '/home' &&
              <>
              <Nav>
                <Form className="d-flex align-items-center" onSubmit={handleSearch}>
                  <InputGroup>
                  <Button
                      className="rounded-start btn-filter"
                      variant="secondary"
                      style={{
                        borderColor: '#A89559',
                        borderWidth: showFilters ? '2.5px' : '1px',
                      }}
                      onClick={() => setShowFilters(!showFilters)}
                      aria-expanded={showFilters}
                    >
                      {(stakeholder || typeDocument || issuanceYear) ? 
                        (<i className="bi bi-funnel-fill h5" />)
                         : 
                        (<i className="bi bi-funnel h5" />)
                      }
                    </Button>
                    <Form.Control
                      type="text"
                      placeholder="Search Document"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className=" mx-3"
                      style={{
                        borderColor: '#A89559',
                      }}
                      
                    />

                    {/* Filters */}
                    <Collapse in={showFilters}>
                      <Card className='filters-card rounded col-8'>
                        <Card.Body>
                          <Card.Title className='d-flex justify-content-between align-items-center mb-3'>
                            Filters
                            {(stakeholder || typeDocument || issuanceYear) && 
                              <Button className='rounded-pill' variant='danger' size='sm' style={{backgroundColor:'darkred'}} onClick={() => {setStakeholder(null);setTypeDocument(null);setIssuanceYear(null)}}> 
                                Reset
                              </Button>
                            }
                            </Card.Title>
                          <Form.Select
                            value={stakeholder || ""}
                            onChange={(e) => setStakeholder(e.target.value)}
                            style={{
                              borderColor: '#A89559',
                              fontWeight: stakeholder ? 'bold' : 'normal',
                            }}
                            className="my-1"
                          >
                            <option value="">No Stakeholder</option>
                            {stakeholders.map((stk) => (
                              <option key={stk.id} value={stk.id}>
                                {stk.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Select
                            id="typeDocumentSelect" // Add an id
                            value={typeDocument || ""}
                            onChange={(e) => setTypeDocument(e.target.value)}
                            style={{
                              borderColor: '#A89559',
                              fontWeight: typeDocument ? 'bold' : 'normal',
                            }}
                            className="my-1"
                          >
                            <option value="">No Type</option>
                            {typeDocuments.map((typo) => (
                              <option key={typo.id} value={typo.id}>
                                {typo.type}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control
                            type="number"
                            placeholder="YYYY"
                            value={issuanceYear || ''}
                            onChange={(e) => setIssuanceYear(e.target.value)}
                            className="rounded my-1"
                            style={{
                              borderColor: '#A89559',
                              fontWeight: issuanceYear ? 'bold' : 'normal',
                            }}
                            min={2000}
                            max={2024}
                            />
                        </Card.Body>
                      </Card>
                    </Collapse>

                    <Button
                      variant="secondary"
                      type="submit"
                      className="rounded-end btn-search"
                      style={{
                        borderColor: '#A89559',
                      }}
                    >
                      <i className="bi bi-search" />
                    </Button>
                  </InputGroup>
                </Form>
              </Nav>
              </>
            }
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
                    navigate('/home');
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
    </>

  );
}
MyNavbar.propTypes = {
  documents: PropTypes.array,
  setDocuments: PropTypes.func,
};
export default MyNavbar;