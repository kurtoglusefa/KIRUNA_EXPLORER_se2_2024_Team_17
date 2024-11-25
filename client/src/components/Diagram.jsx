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


  const OffsetEdge = ({ id, sourceX, sourceY, targetX, targetY, style, data }) => {
    const offset = data?.offset || 50; // Use offset from data (default: 50)
  
    // Calculate control points for a Bezier curve
    const controlX = (sourceX + targetX) / 2; // Midpoint horizontally
    const controlY = Math.min(sourceY, targetY) - offset; // Apply offset to the curve
  
    // Define the edge path
    const path = `M${sourceX},${sourceY} C${controlX},${controlY} ${controlX},${controlY} ${targetX},${targetY}`;
  
    return (
      <path
        id={id}
        d={path} // Set the edge path
        style={{
          fill: 'none',
          stroke: 'black',
          strokeWidth: 2,
          ...style,
        }}
      />
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
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '0', // Normal solid line
          };
        }
        else if(connection.IdConnection === 2){
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
        Text: { min: 50, max: 150 },
        Concept: { min: 150, max: 250 },
        Plan: { min: 250, max: 350 },
        "Blueprints/Effects": { min: 350, max: 450 },
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

      // Map date to y-coordinate
      const mapDateToX = (dateStr) => {
        const { year, month, day } = parseDate(dateStr);
        if (!year || isNaN(year)) return maxX; // Default to maxY if year is invalid
  
        // Clamp year to the valid range
        const clampedYear = Math.min(Math.max(year, startYear), endYear);
        const yearRatio = (clampedYear - startYear) / (endYear - startYear);
  
        // Add finer adjustments for month and day
        const monthAdjustment = (month - 1) / 12; // Fraction of the year, -1 because months are 1-12
        const dayAdjustment = day / 365;          // Fraction of the year, assuming 365 days
        const totalRatio = yearRatio + monthAdjustment / (endYear - startYear) + dayAdjustment / (endYear - startYear);
  
        return minX + totalRatio * (maxX - minX);
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
          const maxScaleNumber = 100000; // The max scale number we need to handle
          const scale_number= scales[Idscale]?.scale_number.split(":")[1];
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
    
    const res = await API.getDocumentConnection(parseInt(node.id));
    setNumberofconnections(res.length);
    setSelectedDocument(documents.find((doc) => doc.IdDocument === parseInt(node.id)));
  };


  const SvgNode = ({ data }) => {
    let path = `src/icon/${stakeholders[data.stakeholder - 1]?.color}/${data.iconSrc}`;
  
    return (
      <div
        style={{
          width: '40px', // Match the icon size
          height: '40px', // Match the icon size
        }}
      >
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
        <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlowProvider>
          <ReactFlow
          nodes={nodes}
          snapGrid={[10, 10]}
          snapToGrid={true}
          minZoom={0.3} 
          maxZoom={2}
          edges={edges}
          edgeTypes={edgeTypes} // Use custom edge types
          fitView={true}
          nodeTypes={{ svgNode: SvgNode }}
          onNodeClick={handleNodeClick} 
        >
          <Background />
          <Controls />
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
    </>
  );
}

export default Diagram;
