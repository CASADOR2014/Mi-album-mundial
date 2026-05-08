
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const botonFoto = document.getElementById('boton-foto');
const btnGuardar = document.getElementById('btn-guardar');
const listaEstampas = document.getElementById('lista-estampas');
const buscador = document.getElementById('buscador');

let fotoCapturada = null;

const PAISES_OFICIALES = [
    "BRASIL", "ARGENTINA", "MÉXICO", "ESTADOS UNIDOS", "CANADÁ", "COLOMBIA", 
    "URUGUAY", "CHILE", "PERÚ", "ECUADOR", "PARAGUAY", "BOLIVIA", "ESPAÑA", 
    "FRANCIA", "ALEMANIA", "ITALIA", "PORTUGAL", "PAÍSES BAJOS", "INGLATERRA", 
    "BÉLGICA", "SUIZA", "CROACIA", "DINAMARCA", "SUECIA", "SERBIA", "JAPÓN", 
    "COREA DEL SUR", "IRÁN", "ARABIA SAUDITA", "AUSTRALIA", "NUEVA ZELANDA", 
    "GHANA", "NIGERIA", "CAMERÚN", "SENEGAL", "MARRUECOS", "TÚNEZ", "COSTA RICA", "COSTA DE MARFIL"
];

let album = JSON.parse(localStorage.getItem('miAlbumEstampas')) || [];

actualizarAlbum();

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => alert("Activa los permisos de cámara"));

botonFoto.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = 300; 
    canvas.height = 400;
    context.drawImage(video, 0, 0, 300, 400);
    fotoCapturada = canvas.toDataURL('image/jpeg', 0.4); 
    alert("📸 Foto capturada");
});

btnGuardar.addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim().toUpperCase();
    const numero = document.getElementById('numero').value;
    const paisInput = document.getElementById('pais').value.trim().toUpperCase();

    if (!nombre || !numero || !paisInput || !fotoCapturada) {
        alert("Completa todos los campos y toma la foto");
        return;
    }

    const idUnica = `${paisInput}-${numero}`;
    const index = album.findIndex(est => est.id === idUnica);

    if (index !== -1) {
        album[index].cantidad++;
    } else {
        album.push({ id: idUnica, nombre, numero, pais: paisInput, foto: fotoCapturada, cantidad: 1 });
    }

    localStorage.setItem('miAlbumEstampas', JSON.stringify(album));
    actualizarAlbum();
    limpiarFormulario();
});

function actualizarAlbum() {
    listaEstampas.innerHTML = "";
    const grupos = {};
    
    // Organizar cartas por país
    album.forEach(est => {
        if (!grupos[est.pais]) grupos[est.pais] = [];
        grupos[est.pais].push(est);
    });

    // Mostrar países en orden alfabético
    Object.keys(grupos).sort().forEach(pais => {
        const seccion = document.createElement('div');
        seccion.className = 'seccion-pais';
        seccion.innerHTML = `<h3>${pais}</h3>`;
        
        const grid = document.createElement('div');
        grid.className = 'grid-estampas';

        grupos[pais].sort((a,b) => a.numero - b.numero).forEach(est => {
            const card = document.createElement('div');
            card.className = 'tarjeta-estampa';
            card.innerHTML = `
                ${est.cantidad > 1 ? `<div class="contador-badge">${est.cantidad}</div>` : ""}
                <img src="${est.foto}">
                <p>#${est.numero} <b>${est.nombre}</b></p>
                <button class="btn-quitar" onclick="eliminar('${est.id}')">Quitar</button>
            `;
            grid.appendChild(card);
        });
        seccion.appendChild(grid);
        listaEstampas.appendChild(seccion);
    });
}

window.eliminar = function(id) {
    const index = album.findIndex(e => e.id === id);
    if(album[index].cantidad > 1) album[index].cantidad--;
    else album.splice(index, 1);
    localStorage.setItem('miAlbumEstampas', JSON.stringify(album));
    actualizarAlbum();
}

function limpiarFormulario() {
    document.getElementById('nombre').value = "";
    document.getElementById('numero').value = "";
    document.getElementById('pais').value = "";
    fotoCapturada = null;
}

buscador.addEventListener('input', (e) => {
    const filtro = e.target.value.toLowerCase();
    document.querySelectorAll('.seccion-pais').forEach(s => {
        s.style.display = s.innerText.toLowerCase().includes(filtro) ? "block" : "none";
    });
});
