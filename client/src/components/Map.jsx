import { useContext, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, useMap, LayersControl, LayerGroup, ZoomControl, GeoJSON, FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'react-tooltip/dist/react-tooltip.css'
import { Button, Card, Form, Spinner, Modal } from "react-bootstrap"; // Importing required components
import { useNavigate } from "react-router-dom";
import AppContext from '../AppContext';
import L from 'leaflet';
import API from '../API';
import '../App.css';
import CardDocument from './CardDocument';
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw"; // Import for the drawing tool
import * as turf from "@turf/turf"; // Install this library for spatial operations
import geoJsonData from "../assets/kiruna.json"; // If the data is saved in a file
import { Rnd } from 'react-rnd'
import MarkerClusterGroup from "react-leaflet-cluster"
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tooltip';

function MapComponent({ locations, setLocations, locationsArea, documents, setSelectedLocation, selectedLocation, handleDocumentClick, fetchLocationsArea }) {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const selectedDocument = useContext(AppContext).selectedDocument;
  const setSelectedDocument = useContext(AppContext).setSelectedDocument;
  const [selectedMarker, setSelectedMarker] = useState(selectedDocument);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const isLogged = context.loginState.loggedIn;
  const [documentTypes, setDocumentTypes] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [modifyMode, setModifyMode] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const offsetDistance = 0; //offset distance between markers
  const mapRef = useRef(null); // To get a reference to the map instance

  // States for multiple document selection
  const [multipleDocMode, setMultipleDocMode] = useState(false);
  const [multipleDocuments, setMultipleDocuments] = useState([]);
  const [multipleAreas, setMultipleAreas] = useState([]);
  const [showPolygons, setShowPolygons] = useState(true);



  const [areaCoordinates, setAreaCoordinates] = useState([]);

  const [areaName, setAreaName] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);

  const [newCoordinates, setNewCoordinates] = useState([]);

  //for setting the initial position of the draggable box (using Rnd) for creating a new document  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const componentWidth = 300; // Width of your component in pixels
  const initialXFromRight = 100; // Distance from the right edge in pixels

  const crypto = window.crypto || window.msCrypto;
  let array = new Uint32Array(1);

  useEffect(() => {
    if (!selectedDocument) {
      setSelectedMarker(null);
      setSelectedArea(null);
    } else {
      setSelectedMarker(selectedDocument);
    }
  }, [selectedDocument]);

  const handleMarkerMultipleSelection = (document) => {
    if (multipleDocuments.includes(document)) {
      setMultipleDocuments((oldDocuments) => {
        console.log(oldDocuments);
        return oldDocuments.filter(item => item !== document);
      });
      if(locationsArea[document.IdLocation]) {
        let area = locationsArea[document.IdLocation];
        area = Array.isArray(area.Area_Coordinates) ? area.Area_Coordinates : JSON.parse(area.Area_Coordinates);
        setMultipleAreas((oldAreas) => {
          console.log(oldAreas);
          console.log(area);
          return oldAreas.filter(item => JSON.stringify(item) !== JSON.stringify(area));
        });
      }
    } else {
      setMultipleDocuments((oldDocuments) => {
        console.log(oldDocuments);
        return [...oldDocuments, document];
      });
      if (locationsArea[document.IdLocation]) {
        let area = locationsArea[document.IdLocation];
        area = Array.isArray(area.Area_Coordinates) ? area.Area_Coordinates : JSON.parse(area.Area_Coordinates);
        console.log(area);
        setMultipleAreas((oldAreas) => {
          return [...oldAreas, area];
        });
      }
    }
  }

  useEffect(() => {
    // Update the window width on resize
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
  }, []);

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
      const handleZoomEnd = () => {
        const zoom = map.getZoom();
        setShowPolygons(zoom >= 13); // Mostra i poligoni solo a zoom >= 12
      };

      // Attach the event listener to the map container
      const mapContainer = map.getContainer();
      mapContainer.addEventListener('wheel', handleWheel);
      map.on("zoomend", handleZoomEnd); // Ascolta i cambiamenti di zoom

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
      setShowCreateArea(false);
    } else {
      alert("Please fill in all fields.");
    }
  };
  const handleMarkerClick = (marker) => {
    setSelectedArea(null);
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

  function MarkerFocus({ position }) {
    const map = useMap();
    useEffect(() => {
      if (selectedMarker && position != [undefined, undefined]) {
        try {
          map.flyTo(position, 15);
        } catch (e) {
          console.error(e);
        }
      }
    }, [position, map]);

    return null;
  }
  MarkerFocus.propTypes = {
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
  };
  

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (modifyMode) {
          if (!isPointInFeature(e.latlng)) {
            alert("You can't add a document that is not in the area of Kiruna");
            return;
          }
          else {
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
          mapRef.current.getContainer().style.cursor = "default";
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
  const CenterMapControl = () => {
    const map = useMap();

    useEffect(() => {
      const centerControl = new L.Control({ position: 'topleft' });

      centerControl.onAdd = () => {
        const container = L.DomUtil.create('div', 'leaflet-bar');

        // create the location button
        const locationButton = L.DomUtil.create('a', '', container);
        locationButton.href = '#';
        locationButton.title = 'Center Map';

        // add the location icon
        locationButton.innerHTML = '<i class="bi bi-crosshair" style="font-size: 20px; color: black;"></i>';

        // add click functionality to center the map
        locationButton.onclick = handleLocationButtonClick;

        return container;
      };

      map.addControl(centerControl);

      return () => {
        map.removeControl(centerControl);
      };
    }, [map]);

    const handleLocationButtonClick = (e) => {
      e.preventDefault();
      map.setView([67.8558, 20.2253], 12); // Center the map to the given coordinates
    };

    return null;
  };
  const createClusterAreaCustomIcon = (cluster) => {
    const count = cluster.getChildCount(); // Number of marker areas in the cluster

    return L.divIcon({
      html: `<div style="
        background-color: red; 
        color: white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        width: 40px; 
        height: 40px; 
        font-size: 14px;
        border: 2px solid white;">
          ${count}
        </div>`,
      className: "custom-cluster-icon",
    });
  };

  const createClusterDocumentCustomIcon = (cluster) => {
    const count = cluster.getChildCount(); // Numero di marker nel cluster

    return L.divIcon({
      html: `<div style="
        background-color: blue; 
        color: white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        width: 40px; 
        height: 40px; 
        font-size: 14px;
        border: 2px solid white;">
          ${count}
        </div>`,
      className: "custom-cluster-icon",
    });
  };

  return (
    <>
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <div style={{ maxHeight: '100%', maxWidth: '100%' }}>
          <MapContainer ref={mapRef} center={[67.8536, 20.2437]} zoomControl={false} zoom={13} minZoom={8} maxBounds={calculateBounds(geoJsonData)} // Constrain the map to Kiruna's bounding box
            maxBoundsViscosity={1.0} doubleClickZoom>
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
            <CenterMapControl />
            {/* Layers */}
            <LayersControl position="topright" collapsed={false}>
              <LayersControl.Overlay name="All Documents" checked>
                <LayerGroup>
                  <MarkerClusterGroup
                    iconCreateFunction={createClusterDocumentCustomIcon}
                  >
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
                          iconPath = `src/icon/${document.IdStakeholder[0].Color ? document.IdStakeholder[0].Color : '8A9FA4'}/${documentTypes[document.IdType - 1]?.iconsrc ? documentTypes[document.IdType - 1]?.iconsrc : 'other.svg'}`;
                        } else {
                          iconPath = `src/icon/${stakeholders[document.IdStakeholder - 1]?.color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                        }
                        return (
                          <Marker
                            className='document-icon'
                            key={index + crypto.getRandomValues(array)}
                            position={position}
                            icon={
                              (selectedDocument?.IdDocument === document.IdDocument || multipleDocuments.includes(document)) ?
                                new L.divIcon({
                                  html: ` 
                                  <svg class'document-icon' width="60" height="60">
                                    <circle cx="30" cy="30" r="25" stroke="blue" stroke-width='3px' fill="lightsteelblue" />
                                    <image href="${iconPath}" x="15" y="15" width="30" height="30" />
                                  </svg> 
                                `,
                                  iconSize: [0, 0],
                                  iconAnchor: [10, 10],
                                  popupAnchor: [20, -10],
                                  className: 'document-icon',
                                })
                                :
                                new L.divIcon({
                                  html: `
                                <svg class'document-icon' width="40" height="40">
                                  <circle cx="20" cy="20" r="16" fill="#ffffff" />
                                  <image href="${iconPath}" x="10" y="10" width="20" height="20" />
                                </svg>
                              `,
                                  iconSize: [0, 0],
                                  iconAnchor: [0, 0],
                                  popupAnchor: [20, 0],
                                  className: 'document-icon',
                                })
                            }
                            draggable={dragMode}
                            eventHandlers={{
                              dragend: (e) => {
                                if (isLogged) {
                                  handleDragEnd(document, e);
                                }
                              },
                              click: () => {
                                if (multipleDocMode) {
                                  handleMarkerMultipleSelection(document);
                                } else {
                                  handleMarkerClick(document);
                                }
                              },
                              mouseover: (e) => {
                                selectedDocument?.IdDocument !== document.IdDocument && e.target.openPopup();
                              },
                              mouseout: (e) => {
                                selectedDocument?.IdDocument !== document.IdDocument && e.target.closePopup();
                              }
                            }}
                          >
                            <Popup
                              keepInView
                              closeOnClick={false}
                              autoClose={false}
                              open={selectedDocument?.IdDocument === document.IdDocument} // Controlled state
                            // Close popup if user clicks close button
                            >{document.Title}</Popup>
                          </Marker>
                        );
                      }
                      return null; // Ensure that the map function returns null if location is not found
                    })}
                  </MarkerClusterGroup>
                </LayerGroup>
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Documents belonging to municipal area">
                <LayerGroup>
                  <MarkerClusterGroup
                    iconCreateFunction={createClusterDocumentCustomIcon}
                  >
                    {documents.map((document, index) => {
                      // Determine the location of the document
                      const location =
                        locationsArea[document.IdLocation] ||
                        locations[document.IdLocation];
                      const offsetIndex = index * offsetDistance;
                      if (location) {
                        let position = [];
                        if (location.Location_Type === "Area" && location.Area_Name === "Municipality of Kiruna") {
                          position = [
                            location.Latitude + (index % 2 === 0 ? offsetIndex : -offsetIndex),
                            location.Longitude + (index % 2 === 0 ? -offsetIndex : offsetIndex),
                          ];
                          let iconPath;
                          if (Array.isArray(document.IdStakeholder) && document.IdStakeholder.length > 0) {
                            iconPath = `src/icon/${document.IdStakeholder[0].Color ? document.IdStakeholder[0].Color : '8A9FA4'}/${documentTypes[document.IdType - 1]?.iconsrc ? documentTypes[document.IdType - 1]?.iconsrc : 'other.svg'}`;
                          } else {
                            iconPath = `src/icon/${stakeholders[document.IdStakeholder - 1]?.color}/${documentTypes[document.IdType - 1]?.iconsrc}`;
                          }
                          return (
                            <Marker
                              className='document-icon'
                              key={index + crypto.getRandomValues(array)}
                              position={position}
                              icon={
                                (selectedDocument?.IdDocument === document.IdDocument || multipleDocuments.includes(document)) ?
                                  new L.divIcon({
                                    html: ` 
                                  <svg class'document-icon' width="60" height="60">
                                    <circle cx="30" cy="30" r="25" stroke="blue" stroke-width='3px' fill="lightsteelblue" />
                                    <image href="${iconPath}" x="15" y="15" width="30" height="30" />
                                  </svg> 
                                `,
                                    iconSize: [0, 0],
                                    iconAnchor: [10, 10],
                                    popupAnchor: [20, -10],
                                    className: 'document-icon',
                                  })
                                  :
                                  new L.divIcon({
                                    html: `
                                <svg class'document-icon' width="40" height="40">
                                  <circle cx="20" cy="20" r="16" stroke="${(selectedDocument?.IdDocument === document.IdDocument) ? 'darkblue' : ''}" stroke-width='3px' fill="${(selectedDocument?.IdDocument === document.IdDocument) ? '#C1D8F0' : '#dddddd'}" />
                                  <image href="${iconPath}" x="10" y="10" width="20" height="20" />
                                </svg>
                              `,
                                    iconSize: [0, 0],
                                    iconAnchor: [0, 0],
                                    popupAnchor: [20, 0],
                                    className: 'document-icon',
                                  })
                              }
                              draggable={dragMode}
                              eventHandlers={{
                                dragend: (e) => {
                                  if (isLogged) {
                                    handleDragEnd(document, e);
                                  }
                                },
                                click: () => {
                                  if (multipleDocMode) {
                                    handleMarkerMultipleSelection(document);
                                  } else {
                                    handleMarkerClick(document);
                                  }
                                },
                                mouseover: (e) => {
                                  selectedDocument?.IdDocument !== document.IdDocument && e.target.openPopup();
                                },
                                mouseout: (e) => {
                                  selectedDocument?.IdDocument !== document.IdDocument && e.target.closePopup();
                                }
                              }}
                            >
                              <Popup
                                keepInView
                                closeOnClick={false}
                                autoClose={false}
                                open={selectedDocument?.IdDocument === document.IdDocument} // Controlled state
                              // Close popup if user clicks close button
                              >{document.Title}</Popup>
                            </Marker>
                          );
                        }
                      }
                      return null; // Ensure that the map function returns null if location is not found
                    })}
                  </MarkerClusterGroup>
                </LayerGroup>
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Areas" checked={modifyMode}>
              <LayerGroup>
                <MarkerClusterGroup
                 iconCreateFunction={createClusterAreaCustomIcon}
                >
                {locationsArea &&
                  Object.values(locationsArea).map((area) => {
                    let coordinates;
                    try {
                      coordinates = Array.isArray(area.Area_Coordinates)
                        ? area.Area_Coordinates
                        : JSON.parse(area.Area_Coordinates);
                    } catch (error) {
                      console.error("Error parsing coordinates:", error);
                      return null;
                    }
                    if(area.Area_Name === "Municipality of Kiruna") {
                      return null;
                    }
                    else
                    {
                      return (
                        <>
                          {/*show markers instead of area  */}
                          {!showPolygons && (
                            <Marker key={`marker-${area.IdLocation}`} position={[area.Latitude, area.Longitude]}
                            icon={
                              new L.divIcon({
                                html: `
                                  <svg class'document-icon' width="40" height="40">
                                    <circle cx="20" cy="20" r="16" stroke="${(selectedDocument?.IdDocument === document.IdDocument) ? 'darkblue' : ''}" stroke-width='3px' fill="${(selectedDocument?.IdDocument === document.IdDocument) ? '#C1D8F0' : '#dddddd'}" />
                                    <image href="src/icon/000000/map-icon.svg" x="10" y="10" width="20" height="20" />
                                  </svg>
                                `,
                                      iconSize: [40, 40],
                                      iconAnchor: [0, 0],
                                      popupAnchor: [27, 0],
                                      className: 'area-icon',
                                    })
                                  }>
                                  <Popup>
                                    {area.Area_Name} <br />
                                    {getNumberOfDocumentsArea(area.IdLocation)} documents
                                  </Popup>
                                </Marker>
                              )}

                              {/* show area only if zoom is higher */}
                              {showPolygons && (
                                <Polygon
                                  key={crypto.getRandomValues(array)}
                                  positions={coordinates}
                                  pathOptions={{
                                    color: "blue",
                                    fillColor: "blue",
                                    fillOpacity: 0.1,
                                    weight: 1,
                                  }}
                                  eventHandlers={{
                                    click: () => {
                                      handleAreaClick(area);
                                    },
                                    mouseover: (e) => {
                                      const layer = e.target;
                                      layer.openPopup();
                                    },
                                    mouseout: (e) => {
                                      e.target.closePopup();
                                    },
                                  }}
                                >
                                  <Popup>
                                    {area.Area_Name} <br />
                                    {getNumberOfDocumentsArea(area.IdLocation)} documents
                                  </Popup>
                                </Polygon>
                              )}
                            </>
                          );
                        }

                      })}
                  </MarkerClusterGroup>
                </LayerGroup>
              </LayersControl.Overlay>
            </LayersControl>
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
                {selectedArea && selectedArea.Area_Name != "Municipality of Kiruna" && (

                  <Polygon
                    key={selectedArea.IdLocation}
                    positions={
                      Array.isArray(selectedArea.Area_Coordinates)
                        ? selectedArea.Area_Coordinates
                        : JSON.parse(selectedArea.Area_Coordinates) // Parse if not already an array
                    }
                    pathOptions={{
                      color: "blue",
                      fillColor: "black",
                      fillOpacity: 0.5,
                      weight: 2,
                    }}
                    eventHandlers={{
                      mouseover: (e) => {
                        e.target.openPopup();
                      },
                      mouseout: (e) => {
                        e.target.closePopup();
                      },
                    }}
                  >
                    <Popup >
                      {selectedArea.Area_Name} <br />
                      {getNumberOfDocumentsArea(selectedArea.IdLocation)} documents
                    </Popup>
                  </Polygon>
                )}
              </FeatureGroup>
            ) : null}

            {locationsArea &&
              Object.values(locationsArea).map((area, index) => {
                if (
                  (selectedArea &&
                    selectedArea.IdLocation === area.IdLocation) ||
                  (selectedMarker &&
                    selectedMarker.IdLocation === area.IdLocation && selectedArea?.Area_Name != "Municipality of Kiruna")
                ) {
                  // Parse the coordinates string into a proper array
                  if (area.Area_Coordinates != null && selectedArea?.Area_Name != "Municipality of Kiruna") {
                    const coordinates = Array.isArray(area.Area_Coordinates)
                      ? area.Area_Coordinates
                      : JSON.parse(area.Area_Coordinates); // If Area_Coordinates is a string, parse it
                    return (
                      <Polygon
                        key={index + crypto.getRandomValues(array)}
                        positions={coordinates} // Use the parsed array as positions
                        pathOptions={{
                          color: "blue",
                          fillColor: "blue",
                          fillOpacity: 0.1,
                        }}
                      >
                        <Popup>
                          {area.Area_Name} <br />
                          {getNumberOfDocumentsArea(area.IdLocation)} documents
                        </Popup>
                      </Polygon>
                    );
                  }
                  const coordinates = Array.isArray(area.Area_Coordinates)
                    ? area.Area_Coordinates
                    : JSON.parse(area.Area_Coordinates); // If Area_Coordinates is a string, parse it
                  return (
                    <Polygon
                      key={index + crypto.getRandomValues(array)}
                      positions={coordinates} // Use the parsed array as positions
                      pathOptions={{
                        color: "blue",
                        fillColor: "black",
                        fillOpacity: 0.5,
                        weight: 2,
                      }}
                      eventHandlers={{
                        click: () => setModifyMode(true),

                      }}
                    >
                      <Popup>
                        {area.Area_Name} <br />
                        {getNumberOfDocumentsArea(area.IdLocation)} documents
                      </Popup>
                    </Polygon>
                  );
                }
              })}
            {/* Marker for selected document visible on top of the cluster*/}
            {selectedDocument && (
              <Marker
              zIndexOffset={100}
              className='document-icon'
              position={[locationsArea[selectedDocument?.IdLocation]?.Latitude || locations[selectedDocument?.IdLocation]?.Latitude , locationsArea[selectedDocument?.IdLocation]?.Longitude || locations[selectedDocument?.IdLocation]?.Longitude]}
              icon={
                new L.divIcon({
                  html: ` 
                  <svg class'document-icon' width="60" height="60">
                    <circle cx="30" cy="30" r="25" stroke="blue" stroke-width='3px' fill="lightsteelblue" />
                    <image href="src/icon/${Array.isArray(selectedDocument.IdStakeholder && selectedDocument.IdStakeholder.length > 0) ? selectedDocument.IdStakeholder[0].Color : selectedDocument.IdStakeholder.Color ? selectedDocument.IdStakeholder.Color : '8A9FA4'}/${documentTypes[selectedDocument.IdType - 1]?.iconsrc ? documentTypes[selectedDocument.IdType - 1]?.iconsrc : 'other.svg'}" x="15" y="15" width="30" height="30" />
                  </svg> 
                `,
                  iconSize: [0, 0],
                  iconAnchor: [10, 10],
                  popupAnchor: [20, -10],
                  className: 'document-icon',
                })
              }
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            >
              <Popup
                keepInView
                closeOnClick={false}
                autoClose={false}
                open={selectedDocument} // Controlled state
              // Close popup if user clicks close button
              >{selectedDocument.Title}</Popup>
            </Marker>
            )}

            {/* Marker for selected location */}
            {modifyMode && !multipleDocMode ? (
              selectedLocation && !selectedArea ? (
                <>
                  <Marker position={selectedLocation} />
                  {/* setView on selected Marker*/}
                  <MarkerFocus position={selectedLocation} />
                </>
              ) : (

                  selectedMarker ? (
                  
                  <MarkerFocus position={locationsArea[selectedMarker?.IdLocation] ? {lat: locationsArea[selectedMarker?.IdLocation]?.Latitude, lng:locationsArea[selectedMarker?.IdLocation]?.Longitude} : {lat:locations[selectedMarker?.IdLocation]?.Latitude, lng: locations[selectedMarker?.IdLocation]?.Longitude}} />
                ) : (
                  selectedArea && <MarkerFocus position={{lat: locationsArea[selectedArea?.IdLocation]?.Latitude, lng:locationsArea[selectedArea?.IdLocation]?.Longitude}} />
                )
              )
            ) : (
              selectedDocument && <MarkerFocus position={locationsArea[selectedDocument?.IdLocation] ? {lat: locationsArea[selectedDocument?.IdLocation]?.Latitude, lng:locationsArea[selectedDocument?.IdLocation]?.Longitude} : {lat:locations[selectedDocument?.IdLocation]?.Latitude, lng: locations[selectedDocument?.IdLocation]?.Longitude}} />
            )}

            <GeoJSON
              data={geoJsonData}
              style={() => ({
                color: "black",
                weight: 2,
                fillColor: "black",
                fillOpacity: 0.2,
              })}
            />

            {multipleDocMode &&  
                multipleAreas?.map((area, index) => {
                  const name = locationsArea[multipleDocuments[index].IdLocation]?.Area_Name;
                  return (
                    <Polygon
                      key={index+crypto.getRandomValues(array)}
                      positions={area} // Use the parsed array as positions
                      pathOptions={{
                        color: "",
                        fillColor: "lightskyblue",
                        fillOpacity: 0.5,
                      }}
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                      }}
                      >
                      <Popup >
                        {name} <br />
                        {getNumberOfDocumentsArea(area.IdLocation)} documents
                      </Popup>
                    </Polygon>
                  );
                }
              )
            }


            {/* <CustomZoomHandler /> */}
          </MapContainer>

          {/* Overlay components*/}
          {/* Document Card */}
          {selectedDocument && !multipleDocMode && (
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
                  key={document?.IdDocument}
                  document={selectedMarker}
                  locationType={locationsArea[selectedMarker?.IdLocation] ? "Area" : "Point"}
                  latitude={locations[selectedMarker?.IdLocation]?.Latitude.toFixed(4)}
                  longitude={locations[selectedMarker?.IdLocation]?.Longitude.toFixed(4)}
                  setSelectedDocument={setSelectedDocument}
                  handleMarkerClick={handleMarkerClick}
                  isLogged={isLogged}
                  viewMode='map'
                  area={locationsArea[selectedMarker?.IdLocation]}
                />
              </Rnd>
            </div>
          )}
          {/* Card location for creating new document */}
          {modifyMode && isLogged &&
            <div>
              <Rnd
                default={{
                  x: windowWidth - componentWidth - initialXFromRight,
                  y: -280,
                  width: 280,
                }}
                bounds={'window'}
              >
              <Card className='text-start form overlay' >
                <Button 
                  variant="close"
                  onClick={() => {setModifyMode(false);setSelectedArea(null);}} 
                  style={{ 
                    position: 'absolute', 
                    top: '3%', 
                    right: '3%' 
                    }} 
                />
                <Card.Header>
                  <Card.Title className='text.center me-5 mt-1'>
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
                      
                      <h6><strong>Latitude:</strong> {selectedLocation?.lat.toFixed(4)}<br></br>
                      <strong>Longitude:</strong> {selectedLocation?.lng.toFixed(4)}</h6>
                      
                    ) : (
                      selectedDocument ? (
                        locationsArea[selectedDocument.IdLocation] ? (
                          <h6><strong>Area:</strong> {locationsArea[selectedDocument.IdLocation]?.Area_Name}</h6>
                                                  
                        ) : (
                        
                          <h6><strong>Latitude:</strong> {locations[selectedDocument?.IdLocation]?.Latitude?.toFixed(4)}<br></br>
                          <strong>Longitude:</strong> {locations[selectedDocument?.IdLocation]?.Longitude?.toFixed(4)}</h6>
                        
                        )
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
                          if(locationsArea[selectedDocument.IdLocation]) {
                            navigate(`../documents/create-document`, { state: { location:{ area: locationsArea[selectedDocument.IdLocation], type: 'Area' }}, relative: 'path' })
                          } else {
                            navigate(`../documents/create-document`, { state: { location: {lat: locations[selectedDocument.IdLocation]?.Latitude.toFixed(4), lng: locations[selectedDocument.IdLocation]?.Longitude.toFixed(4),type: 'Point' }}, relative: 'path' })
                          }
                        }

                          navigate(`../documents/create-document`, { state: { location: { lat: selectedLocation.lat.toFixed(4), lng: selectedLocation.lng.toFixed(4), type: 'Point' } }, relative: 'path' })
                        }
                      }}
                    >
                      Add document
                    </Button>
                  </div>
                </Card>
              </Rnd>
            </div>
          }
        </div>
      )}

      <div className='buttons-container '>
        {/* [BUTTON] Select multiple documents */}
        <button
          id='btn-overlay'
          className='btn-multipleselect mt-auto'
          data-tooltip-id='tooltip'
          data-tooltip-content={'Select Multiple Documents'}
          data-tooltip-place='left-start'
          style={{ backgroundColor: multipleDocMode && 'darkseagreen', border: multipleDocMode && 'solid 3px lightgreen' }}
          onClick={() => {
            if (multipleDocMode) {

              setMultipleDocuments([]);
              setMultipleAreas([]);
            } else {

              setSelectedMarker(null);
              setSelectedDocument(null);
              setSelectedLocation(null);
              setModifyMode(false);
            }


            setMultipleDocMode(!multipleDocMode);
          }
          }
        >
          <img src='src/icon/multipleselect.svg' height={32} width={32} alt="Multiple Select"/>
        </button>

        {isLogged && (
        <>
        {/* [BUTTON] Drag documents */}
        <button 
            id='btn-overlay'
            className="btn-drag"
            data-tooltip-id='tooltip'
            data-tooltip-content={'Move documents in the map'}
            data-tooltip-place='left-start'
            style={{//glow effect
              border: dragMode && 'solid 3px pink',
              backgroundColor: dragMode && 'violet'
              }}
            onClick={() => {
              setDragMode((mode) => !mode);
            }}
          >
            <i className="bi bi-arrows-move"></i>
          </button>

          {/* [BUTTON] Add documents */}
          <button 
            id='btn-overlay'
            className="btn-add"
            data-tooltip-id='tooltip'
            data-tooltip-content={'Add a new document or area'}
            data-tooltip-place='left-start'
            disabled={multipleDocMode}
            style={{//glow effect
              border: modifyMode && 'solid 3px yellow',
              backgroundColor: modifyMode && 'orangered'
              }}
            onClick={() => {
              if (modifyMode) {
                setSelectedArea(null);
              }

              setSelectedLocation(null);

              setModifyMode((mode) => !mode)
            }}
          >
            <i className="bi bi-plus"></i>
          </button>
          
        </>  
        )}
      </div>
      
      <Tooltip border={'solid 1px grey'} className='py-1' id='tooltip' variant='light' delayShow={500}/>

      <div>
        {dragMode && (
          <div className='col text-end mx-5 mb-1 px-4' style={{
            position: 'absolute',
            zIndex: 1000,
            textShadow: '#000000 0px 0px 20px',
            left: '40%',
            bottom: '40px',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '5px',
            borderRadius: '7px',
            border: '1px solid white'
          }}>
            Drag documents enabled
          </div>
        )}
      </div>

      {/* [MODAL] Create New Area */}
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
MapComponent.propTypes = {
  locations: PropTypes.object,
  setLocations: PropTypes.func,
  locationsArea: PropTypes.object,
  documents: PropTypes.array,
  setSelectedLocation: PropTypes.func,
  selectedLocation: PropTypes.object,
  handleDocumentClick: PropTypes.func,
  fetchLocationsArea: PropTypes.func
};

export default MapComponent;