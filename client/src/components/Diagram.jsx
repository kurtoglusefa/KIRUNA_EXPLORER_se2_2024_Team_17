import React, { useEffect, useState,useRef,useContext } from 'react';
import ReactFlow, { Background, Controls, Handle, useReactFlow, ReactFlowProvider, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import CardDocument from './CardDocument';
import AppContext from '../AppContext';
import API from '../API'; // Import API module

function Diagram() {
  const [documents, setDocuments] = useState([]);
  const [numberofconnections, setNumberofconnections] = useState(0);
  const [typeConnections, setTypeConnections] = useState([]);
  const [connections, setConnections] = useState([]);
  const [infoOpened, setInfoOpened] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState(null); //when click on a node, it will be selected

  const [documentTypes, setDocumentTypes] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [scales, setScales] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationsArea, setLocationsArea] = useState([]);

  const context = useContext(AppContext);
  const isLogged = context.loginState.loggedIn;


  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const gapx=200;

  const [selectedEdge, setSelectedEdge] = useState(null);

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
        setScales(res);
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
        if(connection.IdConnection === 1){
          edgeStyle = {
            stroke: 'white',
            strokeWidth: 2,
            strokeDasharray: '0', // Normal solid line
          };
        }
        else if(connection.IdConnection === 2){
          edgeStyle = {
            stroke: 'white',
            strokeWidth: 2,
            strokeDasharray: '5,5', // Dashed line
          };
        }
        else if(connection.IdConnection === 3){
          edgeStyle = {
            stroke: 'white',
            strokeWidth: 2,
            strokeDasharray: '1,3', // Smaller dashed line
          };
        }
        else if(connection.IdConnection === 4){
          edgeStyle = {
            stroke: 'white',
            strokeWidth: 3,
            strokeDasharray: '1,5', // "Dotted" line 
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
      const res = await API.getAllDocuments();
      console.log(res);
      setDocuments(res);
      console.log(res);
      const startYear = 2000;
      const endYear = 2024;
  
      // Define the x-coordinate range
      const minX = 50;  // Top position for the earliest date
      const maxX = 800; // Bottom position for the latest date
    

      const minY= 50;
      const maxY= 500;

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

        const scale= scales[Idscale-1]?.scale_text;
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
          console.log(scales[Idscale-1]);
          console.log(scales[Idscale-1]?.scale_number);
          const maxScaleNumber = 100000; // The max scale number we need to handle
          const scale_number= scales[Idscale-1]?.scale_number.split(":")[1];
          const normalizedValue = (scale_number - 1) / (maxScaleNumber - 1); // Normalize scale_number to [0, 1]

          const scaledValue = scaleRanges.Plan.min + normalizedValue * (scaleRanges.Plan.max - scaleRanges.Plan.min);

          return scaledValue;
        }
      };
      // Convert documents into nodes
      const nodes = res.map((doc, index) => {
        const iconSrc = documentTypes[doc.IdType-1]?.iconsrc || 'default-icon.svg'; // Fallback to a default icon
        const x= mapDateToX(doc.Issuance_Date);
        const y = mapScaleToY(doc.IdScale);
        console.log(y);
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
    fetchConnections();
    fetchTypeConnections();
    fetchDocumentTypes();
    fetchStakeholders();
    fetchScales();  
  }, []);

  useEffect(() => {
    if (documentTypes.length > 0 && stakeholders.length > 0 && scales.length > 0 ) {
      fetchDocuments();
    }
  }, [documentTypes]); // Ensure `fetchDocuments` runs only after `documentTypes` are loaded


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
    let path = `src/icon/${stakeholders[data.stakeholder - 1]?.color}/${data.iconSrc}`;
  
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
              border: '2px solid blue',
              zIndex: -1, // Keep the circle behind the icon
            }}
          />
        )}
        {/* Source handle inside the icon */}
        <Handle
          type="source" // Outgoing edge
          position="top" // Position at the top of the node
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
          position="bottom" // Position at the bottom of the node
          id="target" // Unique ID for the target handle
        />
      </div>
    );
  };
  

  return (
    <>
        {/* Info Button */}
        <i className="bi bi-info-circle-fill h1 info-button" onClick={() => setInfoOpened(!infoOpened)} style={{color:'white'}} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}></i>
        {infoOpened && 
          <img className='info-button me-5' style={{borderRadius:'20px'}} src="/info-connections.png" /> 
        }

        {/* React Flow Diagram*/}
        <div style={{padding: '15px',height: '89vh', backgroundColor:'#111111'}}>
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
          style={{ background: "#111111" }}>
          <Background color="lightgray" gap={gapx} variant={BackgroundVariant.Lines} />
          <Controls  showZoom={false} showInteractive={false} showFitView={true}/>
        </ReactFlow>
        </ReactFlowProvider>
    </div>
    {selectedDocument && (
            <div
              className='document-card overlay col-lg-3 col-md-6 col-sm-9'
              style={{ marginLeft: '1%', bottom: '18%', width: '28%' }}
            >
              <CardDocument
                document={selectedDocument}
                locationType={locationsArea[selectedDocument?.IdLocation] ? "Area" : "Point"}
                latitude={locations[selectedDocument?.IdLocation]?.Latitude.toFixed(4)}
                longitude={locations[selectedDocument?.IdLocation]?.Longitude.toFixed(4)}
                setShowCard={setSelectedDocument}
                setSelectedDocument={setSelectedDocument}
                viewMode='map'
                isLogged={isLogged}
                numberofconnections={numberofconnections}
                areaName={locationsArea[selectedDocument?.IdLocation]?.Area_Name}
              />
            </div>
    )}
    {selectedEdge && (
      <div
        className='connection-info-card overlay col-lg-3 col-md-6 col-sm-9'
        style={{ marginLeft: '1%', bottom: '18%', width: '28%' }}
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

export default Diagram;