const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://' + window.location.hostname + ':3000'
  : window.location.protocol + '//' + window.location.hostname + ':3000';

let map;
let allAirports = [];
let markersGroup;
let airportMarkersMap = new Map(); // IATA -> Marcador de Leaflet

// Estado de la Sonda Geográfica (búsqueda de aeropuertos cercanos)
let probeActive = false;
let probeMarker = null;
let probeCircle = null;
let probeNearbyMarkersGroup = null;

// Estado del aeropuerto seleccionado actualmente
let selectedIata = null;

// Inicializar el mapa
function initMap() {
  map = L.map('map').setView([20, 0], 2);

  // Tiles de CartoDB Dark Matter (estilo oscuro del mapa)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  markersGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    showCoverageOnHover: false
  });
  map.addLayer(markersGroup);

  // Escuchar clics en el mapa para la herramienta Sonda
  map.on('click', onMapClick);
}

// Obtener todos los aeropuertos de la API para la visualización inicial
async function fetchAndRenderAllAirports() {
  try {
    const response = await fetch(`${API_URL}/airports`);
    if (!response.ok) throw new Error('Error al obtener aeropuertos');
    
    allAirports = await response.json();
    populateMarkers(allAirports);
  } catch (error) {
    console.error('Error al listar aeropuertos:', error);
    alert('Error al conectar con la API. Asegúrese de que el backend esté funcionando.');
  }
}

// Poblar el mapa con marcadores
function populateMarkers(airportsList) {
  markersGroup.clearLayers();
  airportMarkersMap.clear();

  airportsList.forEach(airport => {
    if (airport.lat === undefined || airport.lng === undefined) return;

    // Crear marcador
    const marker = L.marker([airport.lat, airport.lng]);
    
    // Contenido del popup al hacer clic en el marcador
    const popupContent = `
      <div class="popup-container">
        <h4>${airport.name}</h4>
        <p>${airport.city} <strong>(${airport.iata_code || airport.iata_faa})</strong></p>
        <span class="popup-visits"><i class="fa-solid fa-plane"></i> Clic para ver detalles</span>
      </div>
    `;
    
    marker.bindPopup(popupContent);

    // Evento de clic en el marcador
    marker.on('click', () => {
      selectAirport(airport.iata_code || airport.iata_faa);
    });

    markersGroup.addLayer(marker);
    airportMarkersMap.set(airport.iata_code || airport.iata_faa, marker);
  });
}

// Seleccionar un aeropuerto: obtener detalles completos, incrementar visitas y abrir la tarjeta
async function selectAirport(iataCode) {
  try {
    selectedIata = iataCode;
    const response = await fetch(`${API_URL}/airports/${iataCode}`);
    if (!response.ok) throw new Error('Error al obtener detalles del aeropuerto');
    
    const details = await response.json();

    // Rellenar la interfaz con los datos del aeropuerto
    document.getElementById('det-name').textContent = details.name;
    document.getElementById('det-iata').textContent = details.iata_faa;
    document.getElementById('det-city').textContent = `${details.city}`;
    document.getElementById('det-icao').textContent = details.icao || 'N/A';
    document.getElementById('det-alt').textContent = `${details.alt} ft`;
    document.getElementById('det-coords').textContent = `${details.lat.toFixed(4)}, ${details.lng.toFixed(4)}`;
    document.getElementById('det-tz').textContent = details.tz || 'N/A';
    document.getElementById('det-visits').textContent = details.visits;

    // Mostrar la tarjeta de detalles y ocultar el estado vacío
    document.getElementById('no-airport-selected').classList.add('hidden');
    document.getElementById('airport-details-card').classList.remove('hidden');

    // Cambiar a la pestaña de Detalles
    switchTab('details-tab');

    // Actualizar la lista de popularidad
    fetchPopularAirports();

    // Centrar el mapa en el marcador seleccionado
    const marker = airportMarkersMap.get(iataCode);
    if (marker) {
      map.setView(marker.getLatLng(), 8);
      marker.openPopup();
    }
  } catch (error) {
    console.error('Error al obtener detalles del aeropuerto:', error);
  }
}

// Obtener el ranking de popularidad desde la API
async function fetchPopularAirports() {
  try {
    const response = await fetch(`${API_URL}/airports/popular`);
    if (!response.ok) throw new Error('Error al obtener aeropuertos populares');
    
    const popular = await response.json();
    const container = document.getElementById('popularity-list');
    container.innerHTML = '';

    if (popular.length === 0) {
      container.innerHTML = `<p class="empty-state">No hay registros de visitas aún.</p>`;
      return;
    }

    const maxVisits = Math.max(...popular.map(p => p.visits || 1));

    popular.forEach((airport) => {
      const percentage = Math.max(5, Math.min(100, ((airport.visits || 0) / maxVisits) * 100));
      const div = document.createElement('div');
      div.className = 'popular-item';
      div.innerHTML = `
        <div class="pop-item-header">
          <span class="pop-item-title">${airport.name} (${airport.iata_faa})</span>
          <span class="pop-item-visits">${airport.visits} visitas</span>
        </div>
        <div class="pop-bar-bg">
          <div class="pop-bar-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      div.addEventListener('click', () => {
        selectAirport(airport.iata_faa);
      });
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar aeropuertos populares:', error);
  }
}

// Función de búsqueda (filtra marcadores y lista dinámicamente)
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      populateMarkers(allAirports);
      return;
    }

    const filtered = allAirports.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.city.toLowerCase().includes(query) || 
      a.iata_faa.toLowerCase().includes(query)
    );

    populateMarkers(filtered);
  });
}

// Configurar el cambio de pestañas
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const activePane = document.getElementById(tabId);

  if (activeBtn && activePane) {
    activeBtn.classList.add('active');
    activePane.classList.add('active');
  }
}

// Herramienta Sonda Geográfica (búsqueda de aeropuertos cercanos)
function setupNearbyTool() {
  const btnToggle = document.getElementById('btn-toggle-probe');
  const btnClear = document.getElementById('btn-clear-probe');
  const slider = document.getElementById('radius-slider');
  const sliderVal = document.getElementById('radius-val');

  slider.addEventListener('input', (e) => {
    sliderVal.textContent = e.target.value;
    if (probeCircle && probeMarker) {
      // Actualizar el radio del círculo en el mapa al mover el slider
      probeCircle.setRadius(e.target.value * 1000);
      triggerNearbyQuery(probeMarker.getLatLng().lat, probeMarker.getLatLng().lng, e.target.value);
    }
  });

  btnToggle.addEventListener('click', () => {
    probeActive = !probeActive;
    if (probeActive) {
      btnToggle.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Selecciona punto en el mapa...';
      btnToggle.classList.replace('btn-primary', 'btn-accent');
      document.getElementById('map').style.cursor = 'crosshair';
    } else {
      resetProbeBtn();
    }
  });

  btnClear.addEventListener('click', () => {
    clearProbe();
  });
}

function resetProbeBtn() {
  probeActive = false;
  const btnToggle = document.getElementById('btn-toggle-probe');
  btnToggle.innerHTML = '<i class="fa-solid fa-location-dot"></i> Activar Sonda Geográfica';
  btnToggle.classList.replace('btn-accent', 'btn-primary');
  document.getElementById('map').style.cursor = '';
}

async function onMapClick(e) {
  if (!probeActive) return;

  const lat = e.latlng.lat;
  const lng = e.latlng.lng;
  const radius = document.getElementById('radius-slider').value;

  // Limpiar la sonda anterior si existe
  if (probeMarker) map.removeLayer(probeMarker);
  if (probeCircle) map.removeLayer(probeCircle);
  if (probeNearbyMarkersGroup) map.removeLayer(probeNearbyMarkersGroup);

  // Colocar el marcador de la sonda en el punto clickeado
  probeMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'probe-icon',
      html: '<i class="fa-solid fa-circle-dot" style="color:#10b981;font-size:24px;text-shadow:0 0 10px #10b981"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }).addTo(map);

  // Dibujar el círculo de radio de búsqueda
  probeCircle = L.circle([lat, lng], {
    color: '#10b981',
    fillColor: '#10b981',
    fillOpacity: 0.1,
    radius: radius * 1000
  }).addTo(map);

  document.getElementById('btn-clear-probe').classList.remove('hidden');
  resetProbeBtn();

  await triggerNearbyQuery(lat, lng, radius);
}

async function triggerNearbyQuery(lat, lng, radius) {
  try {
    const response = await fetch(`${API_URL}/airports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    if (!response.ok) throw new Error('Error en la consulta de aeropuertos cercanos');

    const nearby = await response.json();
    const resultsContainer = document.getElementById('nearby-results-container');
    resultsContainer.innerHTML = '';

    // Ocultar los marcadores principales para resaltar solo los cercanos
    map.removeLayer(markersGroup);

    if (probeNearbyMarkersGroup) map.removeLayer(probeNearbyMarkersGroup);
    probeNearbyMarkersGroup = L.layerGroup().addTo(map);

    if (nearby.length === 0) {
      resultsContainer.innerHTML = `<p class="empty-state">No se encontraron aeropuertos en un radio de ${radius} km.</p>`;
      return;
    }

    nearby.forEach(airport => {
      // Crear marcador especial para cada aeropuerto cercano encontrado
      const m = L.marker([airport.lat, airport.lng], {
        icon: L.divIcon({
          className: 'nearby-marker',
          html: `<div style="background-color:#10b981;width:12px;height:12px;border-radius:50%;box-shadow:0 0 8px #10b981;border:2px solid #fff"></div>`,
          iconSize: [12, 12]
        })
      });

      m.bindPopup(`<strong>${airport.name}</strong><br>${airport.distance.toFixed(1)} km de distancia`);
      m.on('click', () => {
        selectAirport(airport.iata_faa);
      });
      probeNearbyMarkersGroup.addLayer(m);

      // Agregar resultado a la lista del panel lateral
      const div = document.createElement('div');
      div.className = 'nearby-item';
      div.innerHTML = `
        <div class="nearby-item-details">
          <span class="nearby-item-name">${airport.name}</span>
          <span class="nearby-item-city">${airport.city} (${airport.iata_faa})</span>
        </div>
        <span class="nearby-item-dist">${airport.distance.toFixed(1)} km</span>
      `;
      div.addEventListener('click', () => {
        selectAirport(airport.iata_faa);
      });
      resultsContainer.appendChild(div);
    });

    // Ajustar el mapa para mostrar el área de búsqueda completa
    map.fitBounds(probeCircle.getBounds());

  } catch (error) {
    console.error('Error al obtener aeropuertos cercanos:', error);
  }
}

function clearProbe() {
  if (probeMarker) map.removeLayer(probeMarker);
  if (probeCircle) map.removeLayer(probeCircle);
  if (probeNearbyMarkersGroup) map.removeLayer(probeNearbyMarkersGroup);

  probeMarker = null;
  probeCircle = null;
  probeNearbyMarkersGroup = null;

  document.getElementById('btn-clear-probe').classList.add('hidden');
  document.getElementById('nearby-results-container').innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-circle-nodes"></i>
      <p>No hay resultados de sonda activos</p>
    </div>
  `;

  // Restaurar los marcadores principales del mapa
  map.addLayer(markersGroup);
  map.setView([20, 0], 2);
}

// Manejo del formulario Modal (Agregar / Editar aeropuerto)
let isEditMode = false;

function setupModal() {
  const modal = document.getElementById('airport-modal');
  const btnOpen = document.getElementById('btn-open-add-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const form = document.getElementById('airport-form');

  btnOpen.addEventListener('click', () => {
    isEditMode = false;
    document.getElementById('modal-title').textContent = 'Registrar Aeropuerto';
    document.getElementById('form-iata').readOnly = false;
    form.reset();
    modal.classList.remove('hidden');
  });

  btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Acción de editar aeropuerto seleccionado
  document.getElementById('btn-edit-airport').addEventListener('click', async () => {
    if (!selectedIata) return;
    try {
      const response = await fetch(`${API_URL}/airports/${selectedIata}`);
      if (!response.ok) throw new Error('Error al obtener datos para editar');
      const data = await response.json();

      isEditMode = true;
      document.getElementById('modal-title').textContent = 'Modificar Aeropuerto';
      document.getElementById('form-iata').value = data.iata_faa;
      document.getElementById('form-iata').readOnly = true;
      document.getElementById('form-icao').value = data.icao || '';
      document.getElementById('form-name').value = data.name;
      document.getElementById('form-city').value = data.city;
      document.getElementById('form-lat').value = data.lat;
      document.getElementById('form-lng').value = data.lng;
      document.getElementById('form-alt').value = data.alt;
      document.getElementById('form-tz').value = data.tz || '';

      modal.classList.remove('hidden');
    } catch (e) {
      console.error(e);
    }
  });

  // Acción de eliminar aeropuerto seleccionado
  document.getElementById('btn-delete-airport').addEventListener('click', async () => {
    if (!selectedIata) return;
    if (!confirm(`¿Está seguro de que desea eliminar el aeropuerto ${selectedIata}?`)) return;

    try {
      const response = await fetch(`${API_URL}/airports/${selectedIata}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');

      alert('Aeropuerto eliminado exitosamente.');
      
      // Quitar el marcador del mapa
      const marker = airportMarkersMap.get(selectedIata);
      if (marker) {
        markersGroup.removeLayer(marker);
        airportMarkersMap.delete(selectedIata);
      }
      
      // Actualizar la lista local y limpiar la selección
      allAirports = allAirports.filter(a => a.iata_faa !== selectedIata);
      selectedIata = null;

      // Cerrar la tarjeta de detalles
      document.getElementById('airport-details-card').classList.add('hidden');
      document.getElementById('no-airport-selected').classList.remove('hidden');

      fetchPopularAirports();
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el aeropuerto.');
    }
  });

  // Envío del formulario (crear o editar)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const iata = document.getElementById('form-iata').value.toUpperCase().trim();
    const payload = {
      name: document.getElementById('form-name').value.trim(),
      city: document.getElementById('form-city').value.trim(),
      iata_faa: iata,
      icao: document.getElementById('form-icao').value.toUpperCase().trim(),
      lat: parseFloat(document.getElementById('form-lat').value),
      lng: parseFloat(document.getElementById('form-lng').value),
      alt: parseFloat(document.getElementById('form-alt').value) || 0,
      tz: document.getElementById('form-tz').value.trim()
    };

    try {
      let response;
      if (isEditMode) {
        // Modificar aeropuerto existente (PUT)
        response = await fetch(`${API_URL}/airports/${iata}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Crear nuevo aeropuerto (POST)
        response = await fetch(`${API_URL}/airports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Operación fallida');
      }

      const result = await response.json();
      modal.classList.add('hidden');
      alert(isEditMode ? 'Aeropuerto modificado con éxito.' : 'Aeropuerto registrado con éxito.');

      // Actualizar el mapa y los datos locales
      if (isEditMode) {
        // Actualizar el objeto local
        const idx = allAirports.findIndex(a => a.iata_faa === iata);
        if (idx !== -1) allAirports[idx] = result;

        // Quitar el marcador anterior y agregar uno nuevo con la posición actualizada
        const oldMarker = airportMarkersMap.get(iata);
        if (oldMarker) markersGroup.removeLayer(oldMarker);

        const newMarker = L.marker([result.lat, result.lng]);
        newMarker.bindPopup(`
          <div class="popup-container">
            <h4>${result.name}</h4>
            <p>${result.city} <strong>(${result.iata_faa})</strong></p>
            <span class="popup-visits"><i class="fa-solid fa-plane"></i> Clic para ver detalles</span>
          </div>
        `);
        newMarker.on('click', () => selectAirport(result.iata_faa));
        markersGroup.addLayer(newMarker);
        airportMarkersMap.set(result.iata_faa, newMarker);

        // Seleccionar el aeropuerto para recargar la tarjeta de detalles
        selectAirport(result.iata_faa);
      } else {
        allAirports.push(result);

        const newMarker = L.marker([result.lat, result.lng]);
        newMarker.bindPopup(`
          <div class="popup-container">
            <h4>${result.name}</h4>
            <p>${result.city} <strong>(${result.iata_faa})</strong></p>
            <span class="popup-visits"><i class="fa-solid fa-plane"></i> Clic para ver detalles</span>
          </div>
        `);
        newMarker.on('click', () => selectAirport(result.iata_faa));
        markersGroup.addLayer(newMarker);
        airportMarkersMap.set(result.iata_faa, newMarker);

        selectAirport(result.iata_faa);
      }
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  });
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  fetchAndRenderAllAirports();
  fetchPopularAirports();
  setupSearch();
  setupTabs();
  setupNearbyTool();
  setupModal();
});
