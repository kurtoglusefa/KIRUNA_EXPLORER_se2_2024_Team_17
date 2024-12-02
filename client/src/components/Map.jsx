import { useContext, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, useMap, LayersControl, LayerGroup, ZoomControl,GeoJSON  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Card, Form, Spinner, Modal, CardFooter, Col, Overlay } from "react-bootstrap"; // Importing required components
import { redirect, useLinkClickHandler, useNavigate } from "react-router-dom";
import AppContext from '../AppContext';
import L, { DivOverlay, popup } from 'leaflet';
import API from '../API';
import '../App.css';
import CardDocument from './CardDocument';
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw"; // Import for the drawing tool
import { FeatureGroup } from "react-leaflet"; // Import for the drawing tool
import * as turf from "@turf/turf"; // Install this library for spatial operations
import geoJsonData from "../assets/kiruna.json"; // If the data is saved in a file

function MapComponent({ locations, setLocations, locationsArea, documents, setSelectedLocation, propsDocument, selectedLocation, handleDocumentClick, numberofconnections, fetchLocationsArea }) {
  const selectedDocument = useContext(AppContext).selectedDocument;
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [selectedMarker, setSelectedMarker] = useState(selectedDocument);
  const [showCard, setShowCard] = useState(false);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [connectionType, setConnectionType] = useState('');
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const isLogged = context.loginState.loggedIn;
  const [documentTypes, setDocumentTypes] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [modifyMode, setModifyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const offsetDistance = 0.0001; //offset distance between markers
  const mapRef = useRef(null); // To get a reference to the map instance
  const markerRef = useRef(); // To get a reference to the marker instance

  const [areaCoordinates, setAreaCoordinates] = useState([]);

  const [areaName, setAreaName] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);

  const [newCoordinates, setNewCoordinates] = useState([]);
  const [icons, setIcons] = useState({});
  //const offsetDistance = 0.0020; //offset distance between markers
  useEffect(() => {
    // Define an async function inside useEffect
    const updateArea = async () => {

      if (selectedArea && newCoordinates.length > 0) {
    
        // Assuming getCenter is available and newCoordinates is a valid object
        const { lat, lng } = getCenter(newCoordinates);
        // Call the API function with the required parameters
        await API.updateLocationDocument(
          selectedArea.IdLocation,
          "Area",
          lat,
          lng,
          JSON.stringify(newCoordinates)
        );
        await fetchLocationsArea();
      }
    };
    // Call the async function inside useEffect
    updateArea();
  }, [newCoordinates]);  // Make sure to include `selectedArea` in the dependency array

  const getNumberOfDocumentsArea = (locationId) => {
    if (!locations) return 0;
    return Object.values(documents).filter((document) => document.IdLocation == locationId).length;

  };
  // Custom hook to handle zooming behavior
  function CustomZoomHandler() {
    const map = useMap(); // Get the map instance

    useEffect(() => {
      // Disable default scroll zoom
      map.scrollWheelZoom.disable();

      // Custom zoom behavior with Ctrl + scroll
      const handleWheel = (event) => {
        if (event.ctrlKey) {
          event.preventDefault(); // Prevent default page scrolling

          if (event.deltaY < 0) {
            map.zoomIn(); // Zoom in when scroll is up (negative deltaY)
          } else {
            map.zoomOut(); // Zoom out when scroll is down (positive deltaY)
          }
        }
      };

      // Attach the event listener to the map container
      const mapContainer = map.getContainer();
      mapContainer.addEventListener('wheel', handleWheel);

      // Cleanup the event listener when component unmounts
      return () => {
        mapContainer.removeEventListener('wheel', handleWheel);
      };
    }, [map]);

    return null; // This component does not render any UI
  }

  useEffect(() => {
    setLoading(true);
    const fetchDocumentTypes = async () => {
      try {
        const types = await API.getAllTypesDocument();
        setDocumentTypes(types);
        const stakeholders = await API.getAllStakeholders();
        setStakeholders(stakeholders);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocumentTypes();
    setLoading(false);
  }, [documents]);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setSelectedMarker(null);
    setSelectedDocument(null);
    setSelectedLocation(null);
  };

  const getCenter = (areaCoordinates) => {
    let totalLat = 0;
    let totalLng = 0;
    const count = areaCoordinates[0].length;

    areaCoordinates[0].forEach((point) => {
      totalLat += point.lat;
      totalLng += point.lng;
    });

    // Calculate average of latitudes and longitudes
    const centerLat = totalLat / count;
    const centerLng = totalLng / count;

    return { lat: centerLat, lng: centerLng };
  };

  const handleAddArea = async () => {
    if (areaName) {
      
      API.addArea(
        areaName,
        JSON.stringify(areaCoordinates[0]),
        getCenter(areaCoordinates).lat,
        getCenter(areaCoordinates).lng
      )
        .then(async () => {
          await fetchLocationsArea();
        })
        .catch((err) => {
          console.error("Error adding area:", err);
        });
      //setAreaName('');
      //await fetchLocationsArea();
      setConnectionType("");
      setShowCreateArea(false);
    } else {
      alert("Please fill in all fields.");
    }
  };
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setSelectedDocument(marker);
    setSelectedLocation(null);
    handleDocumentClick(marker);
  };

  const handleDrawCreate = (e) => {
    const layer = e.layer;
    const coordinates = layer.getLatLngs();
    if (coordinates !== areaCoordinates) {
      // Prevent unnecessary re-renders
      setAreaCoordinates(coordinates);
      setShowCreateArea(true);
    }
  };

  const handleDragEnd = (document, e) => {
    const { lat, lng } = e.target.getLatLng();
    if (locationsArea[document.IdLocation] && locationsArea[document.IdLocation].Location_Type === "Area") {
      alert("You can't move a document that belongs to an area");
      // Update local state to reflect the new position
      const updatedLocations = { ...locations };
      if (updatedLocations[document.IdLocation]) {
        updatedLocations[document.IdLocation] = {
          ...updatedLocations[document.IdLocation],
          Latitude: lat,
          Longitude: lng
        };
      }
      setLocations(updatedLocations); // Update the state for immediate UI reflection

    }
    else {
      API.updateLocationDocument(
        document.IdLocation,
        "Point",
        lat,
        lng,
        ""
      )
        .then(() => {

          // Update local state to reflect the new position
          const updatedLocations = { ...locations };
          if (updatedLocations[document.IdLocation]) {
            updatedLocations[document.IdLocation] = {
              ...updatedLocations[document.IdLocation],
              Latitude: lat,
              Longitude: lng
            };
          }
          setLocations(updatedLocations); // Update the state for immediate UI reflection
        })
        .catch((err) => {
          console.error('Error updating position:', err);
        });
    }

  };

  function MarkerFocus ({position}) {
    const map = useMap();
    console.log(position);
    useEffect(() => {
        try {
          map.setView(position ? position : map.getLatLng(), map.getZoom());
        } catch (e) {
          console.log(e);
        }
    }, [position, map]);

    return null;
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (modifyMode) {
          if(!isPointInFeature(e.latlng)) {
            alert("You can't add a document that is not in the area of Kiruna");
            return;
          }
          else{
            const { lat, lng } = e.latlng;
            setSelectedLocation({ lat, lng });
          }
        }
        setSelectedDocument(null);
        setSelectedMarker(null);
        setSelectedArea(null);
      },
      mouseover: () => {
        if (modifyMode) {
          mapRef.current.getContainer().style.cursor = "pointer";
        } else {
          mapRef.current.getContainer().style.cursor = "";
        }
      }
    });
    return null;
  }

  const handleModifyArea = (e) => {
    // update the new area coordinates and will case the useEffect to update the area
    setNewCoordinates(e.layers.getLayers()[0].getLatLngs());
  };

  //function to check if click in area of kiruna = Boundaries
  const isPointInFeature = (latlng) => {
    const { lat, lng } = latlng;
    const point = turf.point([lng, lat]); // Create a Turf.js point
    const features = geoJsonData.features; // GeoJSON features
    return features.some((feature) => {
      const polygon = turf.feature(feature.geometry); // Convert geometry to Turf.js format
      return turf.booleanPointInPolygon(point, polygon); // Check if point is inside
    });
  };
  const calculateBounds = (geoJson) => {
    const bbox = turf.bbox(geoJson); // Returns [minX, minY, maxX, maxY]
    return [
      [bbox[1], bbox[0]], // Southwest corner [lat, lng]
      [bbox[3], bbox[2]], // Northeast corner [lat, lng]
    ];
  };


  return (
    <>
      {loading == true ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <div>
          <MapContainer ref={mapRef} center={[67.8536, 20.2437]} zoomControl={false} zoom={15}  minZoom={8} maxBounds={ calculateBounds(geoJsonData)} // Constrain the map to Kiruna's bounding box
      maxBoundsViscosity={1.0} >
            {/* Location listener */}
            <LocationMarker />

            {/* Layers */}
            <LayersControl position="topleft" collapsed>
              <LayersControl.BaseLayer checked name="Satellite">
                <TileLayer
                  url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                  subdomains={['mt1', 'mt2', 'mt3']}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Zoom Buttons - changed position to have it under the satellite/street view */}
            <ZoomControl position="topleft" />
            
            {/* Layers */}
            {isLogged ? (
            <LayersControl position="topright" collapsed={false}>
              <LayersControl.Overlay name="Documents" checked>
                <LayerGroup>
                  {documents.map((document, index) => {
                    // Determine the location of the document
                    const location =
                      locationsArea[document.IdLocation] ||
                      locations[document.IdLocation];
                    const offsetIndex = index * offsetDistance;
                    if (location) {
                      let position = [];
                      if (location.Location_Type === "Point") {
                        position = [location.Latitude, location.Longitude];
                      } else {
                        position = [
                          location.Latitude + (index % 2 === 0 ? offsetIndex : -offsetIndex),
                          location.Longitude + (index % 2 === 0 ? -offsetIndex : offsetIndex),
                        ];
                      }
                      let iconPath;
                      if (Array.isArray(document.IdStakeholder) && document.IdStakeholder.length > 0) {
                         iconPath = `src/icon/${document.IdStakeholder[0].Color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                         console.log(iconPath);
                      } else {
                         iconPath = `src/icon/${stakeholders[document.IdStakeholder-1]?.color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                      }
                      return (
                        <Marker
                          key={index}
                          position={position}
                          icon={
                            new L.Icon({
                              iconUrl: iconPath,
                              iconSize: [32, 32],
                              iconAnchor: [16, 32],
                              popupAnchor: [0, -32],
                            })
                          }
                          draggable={modifyMode}
                          eventHandlers={{
                            dragend: (e) => {
                              if (isLogged) {
                                handleDragEnd(document, e);
                              }
                            },
                            click: () => handleMarkerClick(document),
                          }}
                        >
                          <Popup>{document.Title}</Popup>
                        </Marker>
                      );
                    }
                    return null; // Ensure that the map function returns null if location is not found
                  })}
                </LayerGroup>
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Area" checked={modifyMode}>
                <LayerGroup>
                  {locationsArea &&
                    Object.values(locationsArea).map((area, index) => {
                      let coordinates;
                      try {
                        coordinates = Array.isArray(area.Area_Coordinates)
                          ? area.Area_Coordinates
                          : JSON.parse(area.Area_Coordinates);
                      } catch (error) {
                        console.error("Error parsing coordinates:", error);
                        return null; // Skip this area if coordinates are invalid
                      }

                      return (
                        <Polygon
                          key={index}
                          positions={coordinates} // Use the parsed array as positions
                          pathOptions={{
                            color: "blue",
                            fillColor: "blue",
                            fillOpacity: 0.1,
                          }}
                          eventHandlers={{
                            click: () => handleAreaClick(area),
                          }}
                        >
                          <Popup>
                            {area.Area_Name} <br />
                            {getNumberOfDocumentsArea(area.IdLocation)} documents
                          </Popup>
                        </Polygon>
                      );
                    })}
                </LayerGroup>
              </LayersControl.Overlay>
            </LayersControl>
            ) : (
              <LayerGroup>
                  {documents.map((document, index) => {
                    // Determine the location of the document
                    const location =
                      locationsArea[document.IdLocation] ||
                      locations[document.IdLocation];
                    const offsetIndex = index * offsetDistance;

                    if (location) {
                      let position = [];
                      if (location.Location_Type === "Point") {
                        position = [location.Latitude, location.Longitude];
                      } else {
                        position = [
                          location.Latitude + (index % 2 === 0 ? offsetIndex : -offsetIndex),
                          location.Longitude + (index % 2 === 0 ? -offsetIndex : offsetIndex),
                        ];
                      }


                      let iconPath;
                      if (Array.isArray(document.IdStakeholder) && document.IdStakeholder.length > 0) {
                         iconPath = `src/icon/${document.IdStakeholder[0].Color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                         console.log(iconPath);
                      } else {
                         iconPath = `src/icon/${stakeholders[document.IdStakeholder-1]?.color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                      }
                      
                      return (
                        <Marker
                          key={index}
                          position={position}
                          icon={
                            new L.Icon({
                              iconUrl: iconPath,
                              iconSize: [32, 32],
                              iconAnchor: [16, 32],
                              popupAnchor: [0, -32],
                            })
                          }
                          draggable={modifyMode}
                          eventHandlers={{
                            dragend: (e) => {
                              if (isLogged) {
                                handleDragEnd(document, e);
                              }
                            },
                            click: () => handleMarkerClick(document),
                          }}
                        >
                          <Popup>{document.Title}</Popup>
                        </Marker>
                      );
                    }
                    return null; // Ensure that the map function returns null if location is not found
                  })}
                </LayerGroup>
            )}

            {/* Drawing tools */}
            {isLogged ? (
              <FeatureGroup key={"normal"}>
                <EditControl
                  position="topright"
                  onCreated={handleDrawCreate}
                  onEdited={handleModifyArea}
                  draw={{
                    rectangle: false,
                    polyline: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polygon: true,
                  }}
                  edit={{
                    remove: false
                  }}
                />
                {selectedArea && (

                  <Polygon
                    positions={
                      Array.isArray(selectedArea.Area_Coordinates)
                        ? selectedArea.Area_Coordinates
                        : JSON.parse(selectedArea.Area_Coordinates) // Parse if not already an array
                    }
                    color="black"          // Border color
                    fillColor="black"      // Fill color
                    fillOpacity={0.6}      // Fill opacity
                    weight={2}
                    key={selectedArea.IdLocation}
                  />
                )}
              </FeatureGroup>
            ) : null}

            {locationsArea &&
              Object.values(locationsArea).map((area, index) => {
                if (
                  (selectedArea &&
                    selectedArea.IdLocation === area.IdLocation) ||
                  (selectedMarker &&
                    selectedMarker.IdLocation === area.IdLocation)
                ) {
                  // Parse the coordinates string into a proper array
                  const coordinates = Array.isArray(area.Area_Coordinates)
                    ? area.Area_Coordinates
                    : JSON.parse(area.Area_Coordinates); // If Area_Coordinates is a string, parse it
                  return (
                    <Polygon
                      key={index}
                      positions={coordinates} // Use the parsed array as positions
                      pathOptions={{
                        color: "blue",
                        fillColor: "blue",
                        fillOpacity: 0.1,
                      }}
                    />
                  );
                }
              })}
            {/* Marker for selected location */}
            {modifyMode ? (
              selectedLocation && !selectedArea ? (
              <>
                <Marker position={selectedLocation} />
                {/* setView on selected Marker*/}
                <MarkerFocus position={selectedLocation} />
              </>
              ) : (

                selectedMarker ? (
                  
                  <MarkerFocus position={locationsArea[selectedMarker?.IdLocation] ? {lat: locationsArea[selectedMarker?.IdLocation].Latitude, lng:locationsArea[selectedMarker?.IdLocation].Longitude} : {lat:locations[selectedMarker?.IdLocation]?.Latitude, lng: locations[selectedMarker?.IdLocation]?.Longitude}} />
                ) : (
                  selectedArea && <MarkerFocus position={{lat: locationsArea[selectedArea?.IdLocation].Latitude, lng:locationsArea[selectedArea?.IdLocation].Longitude}} />
                )
              ) 
            ) : (
              selectedDocument && <MarkerFocus position={locationsArea[selectedDocument?.IdLocation] ? {lat: locationsArea[selectedDocument?.IdLocation].Latitude, lng:locationsArea[selectedDocument?.IdLocation].Longitude} : {lat:locations[selectedDocument?.IdLocation]?.Latitude, lng: locations[selectedDocument?.IdLocation]?.Longitude}} />
            )}
            
            {/* setView on selected Marker*/}
            
            {/*(!loading && locations && locationsArea && selectedMarker && selectedDocument) ? <MarkerFocus position={locationsArea[selectedMarker?.IdLocation] ? {lat: locationsArea[selectedMarker?.IdLocation].Latitude, lng:locationsArea[selectedMarker?.IdLocation].Longitude} : {lat:locations[selectedMarker?.IdLocation]?.Latitude, lng: locations[selectedMarker?.IdLocation]?.Longitude}} /> : <MarkerFocus position={{lat:67.8400,lng: 20.2253}}/>*/}
            {/* Markers 
            {documents.map((document, index) => {
              //used to not overleap the documents
              const offsetIndex = index * offsetDistance;
              const location = locationsArea[document.IdLocation] ? locationsArea[document.IdLocation] : locations[document.IdLocation];
              if (location) {
                let position = [];
                if (location.Location_Type === "Point") {
                  position = [
                    location.Latitude,
                    location.Longitude,
                  ];
                }
                else {
                  position = [
                    location.Latitude + (index % 2 === 0 ? offsetIndex : -offsetIndex),
                    location.Longitude + (index % 2 === 0 ? -offsetIndex : offsetIndex),
                  ];
                }
                return (
                  <Marker
                    icon={
                      new L.Icon({
                        iconUrl: `src/icon/${stakeholders[document.IdStakeholder-1]?.color}/${documentTypes[document.IdType - 1]?.iconsrc}`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32],
                      })
                    }
                    draggable={
                      modifyMode
                    } // Only make draggable if logged in
                    eventHandlers={{
                      dragend: (e) => {
                        if (isLogged) {
                          handleDragEnd(document, e); // Only call dragend if logged in
                        }
                      },
                      click: () => handleMarkerClick(document),
                    }}
                    key={index}
                    position={position}
                  >
                    <Popup>{document.Title}</Popup>
                  </Marker>
                );
              }
            })*/}
            <GeoJSON
              data={geoJsonData}
              style={() => ({
                color: "black",
                weight: 1,
                fillColor: "black",
                fillOpacity: 0.2,
              })}

             
            />
            <CustomZoomHandler />
          </MapContainer> 

          {/* Overlay components*/}
          {/* Document Card */}
          {selectedDocument && (
            <div
              className='document-card overlay col-lg-3 col-md-6 col-sm-9'
              style={{ marginLeft: '1%', bottom: '14.5%', width: '30%' }}
            >
              <CardDocument
                document={selectedMarker}
                locationType={locationsArea[selectedMarker?.IdLocation] ? "Area" : "Point"}
                latitude={locations[selectedMarker?.IdLocation]?.Latitude.toFixed(4)}
                longitude={locations[selectedMarker?.IdLocation]?.Longitude.toFixed(4)}
                setShowCard={setSelectedDocument}
                setSelectedDocument={setSelectedDocument}
                isLogged={isLogged}
                viewMode='map'
                numberofconnections={numberofconnections}
                area={locationsArea[selectedMarker?.IdLocation]}
              />
            </div>
          )}
          {/* Card location for creating new document */}
          {modifyMode &&
            <div className='d-flex justify-content-end me-4'>
              <Card className='text-start form overlay' style={{ bottom: '6%' }}>
                <Card.Header>
                  <Card.Title className='text.center mx-4 mt-1'>
                    <strong>Add New Document</strong>
                  </Card.Title>
                  <Button
                    hidden={!selectedLocation && !selectedDocument}
                    variant="link"
                    style={{ color: 'darkred', position: 'absolute', right: '0px', bottom: '50%' }}
                    onClick={() => {setSelectedLocation(null);setSelectedDocument(null)}}>
                    <i className="bi bi-x h2"></i>
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className='mx-3'>
                    <h5>Selected Location:</h5>
                    {selectedLocation ? (
                      <>
                        <h6><strong>Latitude:</strong> {selectedLocation?.lat.toFixed(4)}<br></br>
                          <strong>Longitude:</strong> {selectedLocation?.lng.toFixed(4)}</h6>
                      </>
                    ) : (
                      selectedDocument ? (
                        <>
                          <h6><strong>Latitude:</strong> {locations[selectedDocument.IdLocation]?.Latitude.toFixed(4)}<br></br>
                            <strong>Longitude:</strong> {locations[selectedDocument.IdLocation]?.Longitude.toFixed(4)}</h6>
                        </>

                      ) : (
                      <Form.Group>
                        <Form.Label>
                          <strong>Area</strong>
                        </Form.Label>
                        <Form.Select
                          value={selectedArea ? selectedArea.IdLocation : ""}
                          onChange={(e) => {
                            const area = locationsArea[e.target.value];
                            setSelectedArea(area);
                          }}
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
                      </Form.Group>
                    ))
                    }
                  </div>
                </Card.Body>
                <div className='d-flex justify-content-center'>
                  <Button
                    variant="dark"
                    className='px-4 py-2 mb-2 rounded-pill btn-document'
                    size="md"
                    onClick={() => {
                      if (!selectedLocation && !selectedDocument) {
                        if(!selectedArea) {
                          alert('Select an area')
                          return;
                        }
                        navigate(`../documents/create-document`, { state: { location:{ area: selectedArea,type: 'Area' }}, relative: 'path' })
                      }
                      else {
                        if(selectedDocument) {
                          navigate(`../documents/create-document`, { state: { location: {lat: locations[selectedDocument.IdLocation]?.Latitude.toFixed(4), lng: locations[selectedDocument.IdLocation]?.Longitude.toFixed(4),type: 'Point' }}, relative: 'path' })
                        }

                        navigate(`../documents/create-document`, { state: { location: {lat: selectedLocation.lat.toFixed(4), lng: selectedLocation.lng.toFixed(4),type: 'Point' }}, relative: 'path' })
                      }
                    }}
                  >
                    Add document
                  </Button>
                </div>
              </Card>
            </div>
          }
          {/* Button enable */}
          {isLogged &&
            <>
              <div className='d-flex mt-2 align-items-center justify-content-between ms-3'>
                <div className='d-flex align-items-center'>
                  <Button variant='dark' className='rounded-pill mt-2 overlay px-4 mx-2 btn-document' style={{ bottom: '5%' }} onClick={() => {
                    if(modifyMode)
                      setSelectedArea(null);
                    setSelectedLocation(null);
                    setModifyMode((mode) => !mode)
                  }}>
                    <span className='h6' style={{ fontSize: '16px' }}>{modifyMode ? 'Disable' : 'Enable'} drag / add new location for a document</span>
                  </Button>

                  <div>
                    {modifyMode && <span className='col text-end mx-5 mb-1' style={{ position: 'absolute', zIndex: 1000, textShadow: '#000000 0px 0px 20px', left: '3%', bottom: '9.5%', color: 'white' }}>Drag / Add new document enabled</span>}
                  </div>
                </div>
              </div>

            </>
          }
        </div>
      )}
      <Modal
        show={showCreateArea}
        onHide={() => setShowCreateArea(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create an Area</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDocument">
              <Form.Label>Area</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Area name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddArea}>
            Add Area
          </Button>
          <Button variant="secondary" onClick={() => setShowCreateArea(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MapComponent;
