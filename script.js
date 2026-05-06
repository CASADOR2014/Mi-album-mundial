// --- 1. VARIABLES GLOBALES Y ELEMENTOS ---
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const botonFoto = document.getElementById('boton-foto');
const btnGuardar = document.getElementById('btn-guardar');
const listaEstampas = document.getElementById('lista-estampas');
const buscador = document.getElementById('buscador');

let fotoCapturada = null;

// Cargar álbum desde la memoria del celular (LocalStorage)
// Si no hay nada, empieza con una lista vacía []
let album = JSON.parse(localStorage.getItem('miAlbumEstampas')) || [];

// --- 2. INICIALIZACIÓN ---
// Mostrar las estampas que ya estaban guardadas al abrir la app
actualizarAlbum();

// Encender la cámara
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
})
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error al acceder a la cámara: ", err);
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    });

// --- 3. FUNCIONES DE CAPTURA ---
botonFoto.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    // Ajustar el canvas al tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Dibujar la imagen actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convertir a formato de imagen
    fotoCapturada = canvas.toDataURL('image/png');
    alert("📸 ¡Foto capturada con éxito!");
});

// --- 4. LÓGICA DE GUARDADO Y REPETIDAS ---
btnGuardar.addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim().toUpperCase();
    const numero = document.getElementById('numero').value;
    const pais = document.getElementById('pais').value.trim().toUpperCase();

    // Validación: que nada esté vacío
    if (!nombre || !numero || !pais || !fotoCapturada) {
        alert("¡Hey! Falta algo: llena los datos y tómale foto a la estampa.");
        return;
    }

    // Crear un identificador único para detectar repetidas
    const idUnica = `${pais}-${numero}-${nombre}`;

    // Buscar si esa estampa ya existe en nuestro arreglo
    const indiceExistente = album.findIndex(est => est.id === idUnica);

    if (indiceExistente !== -1) {
        // SI YA EXISTE: Sumamos al contador
        album[indiceExistente].cantidad++;
        alert(`¡Repetida! Ahora tienes ${album[indiceExistente].cantidad} de ${nombre}`);
    } else {
        // SI ES NUEVA: Creamos el objeto
        const nuevaEstampa = {
            id: idUnica,
            nombre: nombre,
            numero: numero,
            pais: pais,
            foto: fotoCapturada,
            cantidad: 1
        };
        album.push(nuevaEstampa);
    }

    // GUARDADO PERMANENTE: Guardar la lista actualizada en el celular
    localStorage.setItem('miAlbumEstampas', JSON.stringify(album));

    // Refrescar la vista y limpiar
    actualizarAlbum();
    limpiarFormulario();
});

// --- 5. RENDERIZADO DEL ÁLBUM ---
function actualizarAlbum() {
    listaEstampas.innerHTML = ""; // Limpiar visualmente antes de redibujar

    album.forEach(est => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-estampa';

        // El badge rojo solo sale si tienes más de 1
        const badge = est.cantidad > 1 ? `<div class="contador-badge">${est.cantidad}</div>` : "";

        tarjeta.innerHTML = `
            ${badge}
            <img src="${est.foto}" alt="Estampa">
            <div class="info-jugador">
                <p class="pais-etiqueta">${est.pais} #${est.numero}</p>
                <p><strong>${est.nombre}</strong></p>
            </div>
        `;
        listaEstampas.appendChild(tarjeta);
    });
}

// --- 6. BUSCADOR EN TIEMPO REAL ---
buscador.addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();
    const tarjetas = document.querySelectorAll('.tarjeta-estampa');

    tarjetas.forEach(tarjeta => {
        // Comprobar si el texto de la tarjeta incluye lo que escribimos
        const contenido = tarjeta.innerText.toLowerCase();
        tarjeta.style.display = contenido.includes(busqueda) ? "block" : "none";
    });
});

// --- 7. UTILIDADES ---
function limpiarFormulario() {
    document.getElementById('nombre').value = "";
    document.getElementById('numero').value = "";
    document.getElementById('pais').value = "";
    fotoCapturada = null;
    // Scroll hacia la colección para ver la nueva estampa
    listaEstampas.scrollIntoView({ behavior: 'smooth' });
}