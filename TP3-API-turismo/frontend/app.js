
const API = "http://127.0.0.1:5001";

 
// Guarda la última búsqueda para usarla en el paso 3
let ultimaBusqueda = {
  lat: null,
  lng: null,
  tipo: null,
  lugares: []
};
 
// ─────────────────────────────────────
// PASO 1 — Agregar lugar
// ─────────────────────────────────────
function agregar() {
  const nombre = document.getElementById("nombre").value.trim();
  const tipo   = document.getElementById("tipo").value;
  const lat    = document.getElementById("lat").value.trim();
  const lng    = document.getElementById("lng").value.trim();
  const msg    = document.getElementById("msg-agregar");
 
  if (!nombre || !lat || !lng) {
    msg.textContent = "⚠️ Completá todos los campos.";
    msg.className = "msg error";
    return;
  }
 
  fetch(`${API}/lugares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, tipo, lat, lng })
  })
    .then(r => r.json())
    .then(d => {
      msg.textContent = "✅ " + d.mensaje;
      msg.className = "msg ok";
      // Limpia los campos
      document.getElementById("nombre").value = "";
      document.getElementById("lat").value = "";
      document.getElementById("lng").value = "";
    })
    .catch(() => {
      msg.textContent = "❌ Error al conectar con el servidor.";
      msg.className = "msg error";
    });
}
 
// ─────────────────────────────────────
// PASO 2 — Buscar cercanos (5 km)
// ─────────────────────────────────────
function buscar() {
  const lat  = document.getElementById("lat2").value.trim();
  const lng  = document.getElementById("lng2").value.trim();
  const tipo = document.getElementById("tipo2").value;
  const lista = document.getElementById("resultados");
 
  if (!lat || !lng) {
    lista.innerHTML = "<li class='msg error'>⚠️ Ingresá tu latitud y longitud.</li>";
    return;
  }
 
  lista.innerHTML = "<li class='cargando'>Buscando...</li>";
 
  fetch(`${API}/lugares?lat=${lat}&lng=${lng}&tipo=${tipo}`)
    .then(r => r.json())
    .then(data => {
      lista.innerHTML = "";
 
      if (!data.length) {
        lista.innerHTML = "<li class='msg error'>No hay lugares dentro de 5 km.</li>";
        bloquearPaso3();
        return;
      }
 
      // Muestra los resultados en la lista
      data.forEach(l => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="lugar-nombre">${l.nombre}</span>
                        <span class="lugar-dist">${l.distancia_km} km</span>`;
        lista.appendChild(li);
      });
 
      // Guarda los datos para el paso 3
      ultimaBusqueda = { lat, lng, tipo, lugares: data };
 
      // Activa el paso 3 con los resultados
      activarPaso3(data);
    })
    .catch(() => {
      lista.innerHTML = "<li class='msg error'>❌ Error al conectar con el servidor.</li>";
      bloquearPaso3();
    });
}
 
// ─────────────────────────────────────
// PASO 3 — Calcular distancia
// Usa los resultados del paso 2
// ─────────────────────────────────────
function activarPaso3(lugares) {
  document.getElementById("dist-bloqueado").style.display = "none";
  document.getElementById("dist-activo").style.display    = "block";
  document.getElementById("resultado-distancia").innerHTML = "";
 
  // Rellena el select con los lugares encontrados en el paso 2
  const select = document.getElementById("destino");
  select.innerHTML = lugares.map(l =>
    `<option value="${l.nombre}">${l.nombre} (${l.distancia_km} km)</option>`
  ).join("");
}
 
function bloquearPaso3() {
  document.getElementById("dist-bloqueado").style.display = "block";
  document.getElementById("dist-activo").style.display    = "none";
}
 
function distancia() {
  const destino = document.getElementById("destino").value;
  const resultado = document.getElementById("resultado-distancia");
 
  if (!ultimaBusqueda.lat) {
    resultado.innerHTML = "<p class='msg error'>⚠️ Realizá primero una búsqueda.</p>";
    return;
  }
 
  resultado.innerHTML = "<p class='cargando'>Calculando...</p>";
 
  fetch(`${API}/distancia?tipo=${ultimaBusqueda.tipo}&origen=usuario&destino=${encodeURIComponent(destino)}&lat=${ultimaBusqueda.lat}&lng=${ultimaBusqueda.lng}`)
    .then(r => r.json())
    .then(data => {
      resultado.innerHTML = `
        <div class="dist-badge">
          <span class="dist-numero">${data.distancia_km} km</span>
          <span class="dist-label">desde tu ubicación hasta<br/><strong>${destino}</strong></span>
        </div>`;
    })
    .catch(() => {
      resultado.innerHTML = "<p class='msg error'>❌ Error al calcular la distancia.</p>";
    });
}