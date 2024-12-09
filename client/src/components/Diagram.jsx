import{ useEffect, useState,useContext } from 'react';
import ReactFlow, { Background, Controls, Handle, ReactFlowProvider, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import CardDocument from './CardDocument';
import AppContext from '../AppContext';
import API from '../API'; // Import API module
import '../App.css'
import '../WelcomePage.css';
import { Rnd } from 'react-rnd';
import PropTypes from 'prop-types';
import {
  Form,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap";

function Diagram({locations,setLocations,locationsArea,documents,setDocuments,fetchDocumentsData}) {
  const selectedDocument = useContext(AppContext).selectedDocument;
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [numberofconnections, setNumberofconnections] = useState(0);
  const [typeConnections, setTypeConnections] = useState([]);
  const [connections, setConnections] = useState([]);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [scales, setScales] = useState([]);

  const context = useContext(AppContext);
  const isLogged = context.loginState.loggedIn;
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [selectConnectionType, setSelectConnectionType] = useState("");
  
 


  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const gapx=200;

  const [selectedEdge, setSelectedEdge] = useState(null);

  const [dataReady, setDataReady] = useState(false); // Tracks when the necessary data is ready
  const [documentsReady, setDocumentsReady] = useState(false); // Tracks when documents are loaded

  const [modifyMode,setModifyMode] = useState(false); // if false i can only on the document, if true i can move the document

  const [filteredDocuments, setFilteredDocuments] = useState([]); // Filtered list of documents for search
  const [selectedDestinationDocument, setSelectedDestinationDocument] = useState(null); // Selected destination document for connection
  const [newConnection, setNewConnection] = useState(false); // New connection object to create

  const updateConnection = async () => {
    
    try {
      if(newConnection==true){
        await API.createDocumentConnection(
          selectedDocument.IdDocument,
          selectedDestinationDocument.IdDocument,
          parseInt(selectConnectionType)
        );
      }
      else
      {
        // Call updateConnection API with the new values
        await API.updateDocumentConnection(
          selectedEdge.IdConnectionDocuments,
          selectedEdge.IdDocument1,
          selectedDestinationDocument.IdDocument,
          parseInt(selectConnectionType)
        );
      }
      // Update the connections after the API call
      await fetchConnections();
  
      // Close the modal after successful update
      setSelectedEdge(null);
      setShowAddConnection(false);
      setNewConnection(false);
    } catch (error) {
      console.error("Error during connection update:", error);
    }
  };
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSelectedDestinationDocument(null); // Reset the selected document
    // Filter documents that match the input
    if (searchValue.length > 0) {
      const filtered = documents.filter(
        (doc) =>
          doc.Title.toLowerCase().includes(searchValue.toLowerCase()) &&
          doc.IdDocument != 1
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments([]);
    }
  };
  const handleSelectDocument = (doc) => {
    setSelectedDestinationDocument(doc);
    setFilteredDocuments([]); // Clear suggestions after selection
  };
  
  const scaleRanges = {
    Text: { min: -200, max: 0 },
    Concept: { min: 0, max: 200 },
    Plan: { min: 200, max: 600 },
    "Blueprints/Effects": { min: 600, max: 800 },
  };

  // function used to convert position of the node in the diagram to the position in the database
  const mapXToDate = (x) => {
    const yearDifference = Math.floor((x - 0) / gapx); // Calculate the year offset from the start year
    const year = 2000 + yearDifference;
  
    const monthFraction = (x - 0 - yearDifference * gapx) / gapx; // Remaining part for months and days
    const month = Math.floor(monthFraction * 12) + 1; // Fraction to month (1-12)
  
    const dayFraction = (monthFraction * 12 - Math.floor(monthFraction * 12)) * 30; // Remaining part for days
    const day = Math.floor(dayFraction) + 1; // Fraction to day (1-30)

  
    // Format the date string as YYYY/MM/DD
    const dateStr = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    console.log(dateStr);
    return dateStr;
    
  };
  const mapYToScale = (y) => {
    
    if(y<=scaleRanges.Text.max){
      return 1;
    }
    else if(y<=scaleRanges.Concept.max){
      return 2;
    }
    else if (y<=scaleRanges.Plan.max){
      // inside the architecture scale plan
      const maxScaleNumber = 100000; // The max scale number we need to handle
      const normalizedValue = (y - scaleRanges.Plan.min) / (scaleRanges.Plan.max - scaleRanges.Plan.min); // Normalize y to [0, 1]
      const scale_number = Math.round(normalizedValue * (maxScaleNumber - 1)) + 1; // Convert normalized value back to scale number
      return scale_number;

    }
    else if(y<=scaleRanges["Blueprints/Effects"].max){
      return 3;
    }
  };



  const OffsetEdge = ({ id, sourceX, sourceY, targetX, targetY, style, data }) => {
    const offset = data?.offset || 50; // Use offset from data (default: 50)
  
    // Calculate control points for a Bezier curve
    const controlX = (sourceX + targetX) / 2; // Midpoint horizontally
    const controlY = Math.min(sourceY, targetY) - offset; // Apply offset to the curve
  
    // Define the edge path
    const path = `M${sourceX},${sourceY} C${controlX},${controlY} ${controlX},${controlY} ${targetX},${targetY}`;
  
    return (
      <g>
        {/* Invisible path for click interaction */}
        <path
          d={path}
          style={{
            fill: 'none',
            stroke: 'transparent', // Invisible stroke
            strokeWidth: 15, // Expanded clickable area
            cursor: 'pointer', // Indicates interactivity
          }}
        />
        
        {/* Visible path */}
        <path
          id={id}
          d={path}
          style={{
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2, // Normal stroke width
            ...style,
          }}
        />
      </g>
    );
  };
  OffsetEdge.propTypes = {
    id: PropTypes.string.isRequired,  // id are string
    sourceX: PropTypes.number.isRequired,
    sourceY: PropTypes.number.isRequired, 
    targetX: PropTypes.number.isRequired, 
    targetY: PropTypes.number.isRequired, 
    style: PropTypes.object,
    data: PropTypes.object,
  };
  const edgeTypes = {
    offsetEdge: OffsetEdge, // Register the custom edge type
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await API.getAllTypesDocument();
      setDocumentTypes(res);
    } catch (err) {
      console.error('Error fetching document types:', err);
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
  const fetchScales = async () => { 
    try { 
        
        const res = await API.getScales(); 
        const scalesArray = []; 
        res.forEach(scale => { 
        scalesArray[scale.id] = scale; 
        }); 
        setScales(scalesArray); 
    } catch (err) { 
        console.error(err); 
    } 
  };
  const fetchTypeConnections = async () => {
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
const fetchConnections = async () => {
  try {
      const res = await API.getAllDocumentConnections();
      const offsetObjects =[];
      res.forEach((connection) => {
        offsetObjects[connection.IdDocument1+"-"+connection.IdDocument2] = 0;
      });
      let edges = res.map((connection) => {
        offsetObjects[connection.IdDocument1+"-"+connection.IdDocument2] = offsetObjects[connection.IdDocument1+"-"+connection.IdDocument2]+1;
        let edgeStyle = {}; // Define a default edge style
        if(connection.IdConnection === 2){
          edgeStyle = {
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '0', // Normal solid line
          };
        }
        else if(connection.IdConnection === 1){
          edgeStyle = {
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '5,5', // Dashed line
          };
        }
        else if(connection.IdConnection === 3){
          edgeStyle = {
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '1,3', // Smaller dashed line
          };
        }
        else if(connection.IdConnection === 4){
          edgeStyle = {
            stroke: 'black',
            strokeWidth: 3,
            strokeDasharray: '8,4,1,4', // "Dotted" line 
          };
        }
        return {
          id: `e${connection.IdConnectionDocuments}`,
          source: connection.IdDocument1.toString(),
          target: connection.IdDocument2.toString(),
          style: edgeStyle, // Apply the edge style dynamically
          type: 'offsetEdge',
          data: { offset: offsetObjects[connection.IdDocument1+"-"+connection.IdDocument2]*30 }, // Offset of 100 for upward curve
        };
      });
      console.log(offsetObjects);

      setConnections(res);
      setEdges(edges);
    } catch (err) {
      console.error(err);
    }
};
const fetchDocuments = async () => {
  try {
  
      const startYear = 2000;
  
      // Define the x-coordinate range
      const minX = 50;  // Top position for the earliest date

      const scaleRanges = {
        Text: { min: -200, max: 0 },
        Concept: { min: 0, max: 200 },
        Plan: { min: 200, max: 600 },
        "Blueprints/Effects": { min: 600, max: 800 },
      };
  
      // Helper to parse `DD/MM/YYYY` format
      const parseDate = (dateStr) => {
        if (!dateStr) return { year: null, month: null, day: null };
      
        const parts = dateStr.split('/'); // Split by `/`
      
        // Case 1: Year only
        if (parts.length === 1) {
          const year = parseInt(parts[0], 10);
          return { year, month: null, day: null };
        }
      
        // Case 2: Month and Year (e.g., "2004/05")
        if (parts.length === 2) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);

          return { year, month, day: null };
        }
      
        // Case 3: Full Date (e.g., "2000/11/27")
        if (parts.length === 3) {
          const day = parseInt(parts[2], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[0], 10);
          return { year, month, day };
        }
      
        // If the date format is not recognized
        return { year: null, month: null, day: null };
      };

      const mapDateToX = (dateStr) => {
        const { year, month, day } = parseDate(dateStr);
        console.log("dateStr",parseDate(dateStr));
        if (!year || isNaN(year)) return minX; // Default to minX if year is invalid
    
        // Calculate the year offset from the start year
        const yearDifference = year - startYear;
    
        // Compute x position with 200px gap per year
        let x = minX + yearDifference * gapx;
    
        // Adjust further for month and day within the year
        if (month) {
            const monthRatio = (month - 1) / 12; // Fraction of a year for the month
            x += monthRatio * gapx; // 200px for one year
        }
        if (day) {
            const dayRatio = day / 365; // Fraction of a year for the day
            x += dayRatio * gapx; // 200px for one year
        }
    
        return x;
      };
      const mapScaleToY = (Idscale) => {

        const scale= scales[Idscale]?.scale_text;
        console.log(scale);
        if(scale === "Text"){
          return scaleRanges.Text.min;
        }
        else if(scale === "Concept"){
          return scaleRanges.Concept.min;
        }
        else if(scale === "Blueprints/effects"){
          return scaleRanges["Blueprints/Effects"].min;
        }
        else{
          // this is scale type plan
          const maxScaleNumber = 100000; // The max scale number we need to handle
          const scale_number= scales[Idscale]?.scale_number.split(":")[1];
          const normalizedValue = (scale_number - 1) / (maxScaleNumber - 1); // Normalize scale_number to [0, 1]

          const scaledValue = scaleRanges.Plan.min + normalizedValue * (scaleRanges.Plan.max - scaleRanges.Plan.min);

          return scaledValue;
        }
      };
      // Convert documents into nodes
      const nodes = documents.map((doc) => {
        const iconSrc = documentTypes[doc.IdType-1]?.iconsrc || 'other.svg'; // Fallback to a default icon
        const x= mapDateToX(doc.Issuance_Date);
        console.log("asse x",x);
        const y = mapScaleToY(doc.IdScale);
        return {
          id: doc.IdDocument.toString(), // Ensure `id` is a string
          position: { x: x, y: y }, // Stagger nodes horizontally
          type: 'svgNode', // Custom node type
          data: {
            label: doc.Title,
            iconSrc, // Pass icon source as part of the data
            stakeholder: doc.IdStakeholder,
            id: doc.IdDocument,
          },

        };
      });

      setNodes(nodes);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };
  
  useEffect(() => {
    // Initial data fetching
    fetchConnections();
    fetchTypeConnections();
    fetchDocumentTypes();
    fetchStakeholders();
    fetchScales();
  }, []); // Run once on mount
  
  useEffect(() => {
    // Check if all dependencies are loaded
    if (documentTypes.length > 0 && stakeholders.length > 0 && scales.length > 0) {
      setDataReady(true); // Set the flag when all dependencies are loaded
    }
  }, [documentTypes, stakeholders, scales]); // Depend on these arrays
  
  useEffect(() => {
    // Trigger document fetching when data is ready
    if (dataReady) {
      fetchDocuments().then(() => setDocumentsReady(true)); // Set the flag after documents are fetched
    }
  }, [dataReady,documents]); // Runs when `dataReady` becomes `true`
  
  useEffect(() => {
    // Handle selection logic after nodes are set
    if (documentsReady) {
      if (selectedDocument) {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedDocument.IdDocument.toString()
              ? { ...node, selected: true } // Mark the node as selected
              : { ...node, selected: false } // Deselect all other nodes
          )
        );
      } else {
        // If no document is selected, clear all selections
        setNodes((prevNodes) =>
          prevNodes.map((node) => ({ ...node, selected: false }))
        );
      }
    }
  }, [documentsReady, selectedDocument]); // Depend on `documentsReady` and `selectedDocument`


  const handleNodeClick = async(event, node) => {
    setSelectedEdge(null);
    const res = await API.getDocumentConnection(parseInt(node.id));
    setNumberofconnections(res.length);
    setSelectedDocument(documents.find((doc) => doc.IdDocument === parseInt(node.id)));
  };
  const handleEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdges((prevEdges) =>
      prevEdges.map((e) =>
        e.id === edge.id
          ? { ...e, style: { ...e.style, stroke: 'blue', strokeWidth: 3 } }
          : { ...e, style: { ...e.style, stroke: 'black', strokeWidth: 2 } }
      )
    );
    const connection = connections.find((conn) => `e${conn.IdConnectionDocuments}` === edge.id);
    setSelectedDocument(null);
    setSelectedEdge(connection);
  };
  const CloseVisualizeEdge = () => {
    setEdges((prevEdges) =>
      prevEdges.map((e) =>
        e.id === `e${selectedEdge.IdConnectionDocuments}`
          ? { ...e, style: { ...e.style, stroke: 'black', strokeWidth: 2 } }
          : e
      )
    );
    setSelectedEdge(null);
  };
  const handleConnect = (params) => {
   console.log("PARAMS");
   console.log(params);
   setSelectedDestinationDocument(documents.find((doc) => doc.IdDocument === parseInt(params.target)));
   setSelectedDocument(documents.find((doc) => doc.IdDocument === parseInt(params.source)));
   setShowAddConnection(true);
   setNewConnection(true);
  };


  const SvgNode = ({ data ,selected }) => {
    if(!data) return null;
    let path="";
    console.log("quello che passo",data);
    
    if(data.stakeholder){
      path = `src/icon/${data.stakeholder[0].Color}/${data.iconSrc}`;
    }
    else{   
      path = `src/icon/8A9FA4/${data.iconSrc}`;
    }
    return (
      <div
      style={{
        position: 'relative',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        {/* Render a circle around the node if selected */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: selectedDocument ? '2px solid blue' : null,
              zIndex: -1, // Keep the circle behind the icon
            }}
          />
        )}
        {/* Source handle inside the icon */}
        <Handle
          type="source" // Outgoing edge
          position="right" // Position at the top of the node
          id="source" // Unique ID for the source handle
          
        />
  
        <img
          src={path}
          alt="Node Icon"
          style={{
            width: '40px', // Width of the icon
            height: '40px', // Height of the icon
            
          }}
        />
        {/* Target handle inside the icon */}
        <Handle
          type="target" // Incoming edge
          position="left" // Position at the bottom of the node
          id="target" // Unique ID for the target handle
          
        />
      </div>
    );
  };
  SvgNode.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
  };

  const onNodeDrag = (event, node) => {
    console.log('Node is being dragged', node);
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              position: {
                x: node.position.x,
                y: node.position.y,
              },
            }
          : n
      )
    );
  };
  
  const onNodeDragStop = async (event, node) => {
      console.log('Node is being dragged', node);
  
      // Update the position of the dragged node in the state
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === node.id
            ? {
                ...n,
                position: {
                  x: node.position.x,
                  y: node.position.y,
                },
              }
            : n
        )
      );
      
      // Map X to Date (check in the same year of doc.Issuance_Date) and Y to Scale
      let x = mapXToDate(node.position.x);
      
      console.log("Mapped X (Date):", x);
  
      let y = mapYToScale(node.position.y);
      console.log("Mapped Y (Scale):", y);
  
      // If the scale is greater than 4, add a new scale and update `y`
      if (y > 4) {
        console.log("Updating scale...");
        let result = await API.addScale("new scale", "1:" + y);
        
        // Ensure the scaleId is returned correctly
        if (result && result.scaleId) {
          y = result.scaleId;
          console.log("Updated scaleId:", y);
        } else {
          console.error("Error: API.addScale did not return a valid scaleId.");
        }
      }
      try {
      // Find the document to update
        let d = documents.find((doc) => doc.IdDocument === parseInt(node.id));
        console.log("Document found:", d);
        
        // Call updateDocument API with the new values
        if (d.Issuance_Date.substring(0,4) === x.substring(0,4)) {
          // Call updateDocument API with the new values
          await API.updateDocument(
            d.IdDocument,
            d.Title,
            d.IdStakeholder.map((stk) => stk.IdStakeholder),
            y,  // Updated scale (y)
            x,  // Mapped date (x)
            d.Language,
            d.Pages,
            d.Description,
            d.IdType,
            d.IdLocation
          );
          await fetchDocumentsData();
          await fetchDocuments();
        } else {
          alert("You can only move the document in the same year of the document");
          await fetchDocumentsData();
          await fetchDocuments();
        }
    } catch (error) {
      console.error("Error during drag stop:", error);
    }
  };
  

  return (
  <>
    <div style={{display:'flex'}}>
      {/* React Flow Diagram*/}
      <div style={{padding: '15px',height: '89vh', width:'100vw', backgroundColor:'#FDFDFD'}}>
        {/* Diagram */}
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            snapGrid={[10, 10]}
            snapToGrid={true}
            minZoom={0.3} 
            maxZoom={1.6}
            edges={edges}
            edgeTypes={edgeTypes} // Use custom edge types
            fitView={true}
            nodeTypes={{ svgNode: SvgNode }}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick} 
            onEdgeClick={handleEdgeClick}
            onNodeDrag={modifyMode ? onNodeDrag : null} // Only enable drag if modifyMode is true
            onNodeDragStop={modifyMode ? onNodeDragStop : null} // Only enable drag if modifyMode is true
            onNodeMouseEnter={(e) => e.target.style.cursor = 'pointer'}
            onNodeMouseLeave={(e) => e.target.style.cursor = 'drag'}
            style={{ background: "#FDFDFD" }}>
            <Background color="lightgray" gap={gapx} variant={BackgroundVariant.Lines} />
            <Controls  showZoom={false} showInteractive={false} showFitView={true}/>
          </ReactFlow>
        </ReactFlowProvider>
        {isLogged &&
            <>
              <div className='d-flex mt-2 align-items-center justify-content-between ms-3'>
                <div className='d-flex align-items-center'>
                  <Button variant='dark' size='sm' className='rounded-pill mt-2 overlay px-4 btn-document' style={{ left:'3.5%', bottom: '5%' }} onClick={() => {
                    setModifyMode((mode) => !mode)
                  }}>
                    <span className='h6' style={{ fontSize: '16px' }}>{modifyMode ? 'Disable' : 'Enable'} drag document</span>
                  </Button>

                  <div>
                    {modifyMode && <span className='col text-end mx-5 mb-1' style={{ position: 'absolute', zIndex: 1000, textShadow: '#000000 0px 0px 20px', left: '450px', bottom: '5%', color: 'black' }}>Drag  document enabled</span>}
                  </div>
                </div>
              </div>

            </>
          }
      </div>
    
      
    
    </div>

    {/* Card Document */}

    {selectedDocument && (
      <div
        className='document-card overlay col-lg-3 col-md-6 col-sm-9'
        
      >
        <Rnd 
          default={{
            x: 60,
            y: -730
          }}
          minHeight={650}
          minWidth={600}
        >
        <CardDocument
          document={selectedDocument}
          locationType={locationsArea[selectedDocument?.IdLocation] ? "Area" : "Point"}
          latitude={locations[selectedDocument?.IdLocation]?.Latitude.toFixed(4)}
          longitude={locations[selectedDocument?.IdLocation]?.Longitude.toFixed(4)}
          setShowCard={setSelectedDocument}
          setSelectedDocument={setSelectedDocument}
          setSelectedMarker={setSelectedDocument}
          viewMode='map'
          isLogged={isLogged}
          numberofconnections={numberofconnections}
          area={locationsArea[selectedDocument?.IdLocation]}
        />
        </Rnd>
      </div>
    )}

    {/* Card Connection */}
    {selectedEdge && (
      <div
        className='overlay col-lg-3 col-md-6 col-sm-9 p-3'
        style={{ marginLeft: '1%', bottom: '18%', width: '28%', backgroundColor: 'white', borderRadius: '20px' }}
      >
        <div>
          <h5>Connection Details</h5>
          <p><strong>Type:</strong> {typeConnections[selectedEdge.IdConnection]?.Type}</p>
          <p><strong>Documents:</strong> {documents.find((doc) => doc.IdDocument === parseInt(selectedEdge.IdDocument1)).Title} ↔ {documents.find((doc) => doc.IdDocument === parseInt(selectedEdge.IdDocument2)).Title}</p>
          {/* Add more details as needed */}
          <button onClick={() => {CloseVisualizeEdge()}} className="mx-2 rounded-pill btn-logout btn btn-sm">
            Close
          </button>
          
          {isLogged ? (
          <button onClick={() => {
            setSelectedDestinationDocument(documents.find((doc) => selectedDocument?.IdDocument != doc.IdDocument &&  doc.IdDocument === parseInt(selectedEdge.IdDocument2)));
            setShowAddConnection(!showAddConnection);
            setSelectConnectionType(typeConnections[selectedEdge.IdConnection]?.IdConnection);
            }} className="mx-2 rounded-pill btn-logout btn btn-sm">
            Modify
          </button>
          ) : null}
           {isLogged ? (
          <button onClick={async() => {
            //API.deleteof id
            setSelectConnectionType(typeConnections[selectedEdge.IdConnection]?.IdConnection);
            await API.deleteDocumentConnection(selectedEdge.IdConnectionDocuments);
            await fetchConnections();
            setSelectedEdge(null);
            }} className="mx-2 rounded-pill btn-logout btn btn-sm">
            Delete
          </button>
          ) : null}
        </div>
      </div>
    )}
    <Modal
        show={showAddConnection}
        centered
        onHide={() => setShowAddConnection(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{newConnection == false?   "Update Connection": "New Connection" }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form.Group controlid="formDocument" style={{ position: "relative" }}>
            <Form.Label>Document</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search for a document"
              value={selectedDestinationDocument?.Title}
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
              value={typeConnections[selectedEdge?.IdConnection]?.IdConnection}
              onChange={(e) => setSelectConnectionType(e.target.value)}
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
            onClick={updateConnection}
          >
            Update Connection
          </Button>
        </Modal.Footer>
      </Modal>
  </>
  );
}

Diagram.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  setLocations: PropTypes.func.isRequired,
  locationsArea: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  setDocuments: PropTypes.func.isRequired,
};

export default Diagram;