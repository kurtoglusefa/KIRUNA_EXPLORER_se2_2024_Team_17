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

function Diagram({locations,setLocations,locationsArea,documents,setDocuments}) {
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


  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const gapx=200;

  const [selectedEdge, setSelectedEdge] = useState(null);

  const [dataReady, setDataReady] = useState(false); // Tracks when the necessary data is ready
  const [documentsReady, setDocumentsReady] = useState(false); // Tracks when documents are loaded


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
      
        // Case 2: Month and Year (e.g., "05/2004")
        if (parts.length === 2) {
          const month = parseInt(parts[0], 10);
          const year = parseInt(parts[1], 10);
          return { year, month, day: null };
        }
      
        // Case 3: Full Date (e.g., "27/11/2000")
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          return { year, month, day };
        }
      
        // If the date format is not recognized
        return { year: null, month: null, day: null };
      };

      const mapDateToX = (dateStr) => {
        const { year, month, day } = parseDate(dateStr);
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
          console.log(scales[Idscale]);
          console.log(scales[Idscale]?.scale_number);
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
        const y = mapScaleToY(doc.IdScale);
        console.log("ciao"+doc.IdStakeholder);
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


  const SvgNode = ({ data ,selected }) => {
    let path = `src/icon/${data.stakeholder[0].Color ? data.stakeholder[0].Color: '8A9FA4'}/${data.iconSrc}`;
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
          style={{ opacity: 0 }} // Make it invisible
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
          style={{ opacity: 0 }} // Make it invisible
        />
      </div>
    );
  };
  SvgNode.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
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
            onNodeClick={handleNodeClick} 
            onEdgeClick={handleEdgeClick}
            onNodeMouseEnter={(e) => e.target.style.cursor = 'pointer'}
            onNodeMouseLeave={(e) => e.target.style.cursor = 'drag'}
            style={{ background: "#FDFDFD" }}>
            <Background color="lightgray" gap={gapx} variant={BackgroundVariant.Lines} />
            <Controls  showZoom={false} showInteractive={false} showFitView={true}/>
          </ReactFlow>
        </ReactFlowProvider>
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
        </div>
      </div>
    )}
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