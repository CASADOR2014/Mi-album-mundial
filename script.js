const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const botonFoto = document.getElementById('boton-foto');
const btnGuardar = document.getElementById('btn-guardar');
const listaEstampas = document.getElementById('lista-estampas');
const buscador = document.getElementById('buscador');

let fotoCapturada = null;


let album = JSON.parse(localStorage.getItem('miAlbumEstampas')) || [];

actualizarAlbum();


navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
})
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error de cámara: ", err);
        alert("Revisa los permisos de tu cámara en el navegador.");
    });


botonFoto.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    fotoCapturada = canvas.toDataURL('image/png');
    alert("📸 ¡Foto capturada correctamente!");
});

btnGuardar.addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim().toUpperCase();
    const numero = document.getElementById('numero').value;
    const pais = document.getElementById('pais').value.trim().toUpperCase();

    if (!nombre || !numero || !pais || !fotoCapturada) {
        alert("Faltan datos o la foto. ¡Asegúrate de llenar todo!");
        return;
    }


    const idUnica = `${pais}-${numero}-${nombre}`;
    const indiceExistente = album.findIndex(est => est.id === idUnica);

    if (indiceExistente !== -1) {

        album[indiceExistente].cantidad++;
        alert(`¡Repetida detectada! Ahora tienes ${album[indiceExistente].cantidad} de ${nombre}.`);
    } else {

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


    guardarYRefrescar();
    limpiarFormulario();
});


function actualizarAlbum() {
    listaEstampas.innerHTML = "";

    album.forEach((est, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-estampa';


        const badge = est.cantidad > 1 ? `<div class="contador-badge">${est.cantidad}</div>` : "";

        tarjeta.innerHTML = `
            ${badge}
            <img src="${est.foto}" alt="Estampa">
            <div class="info-jugador">
                <p class="pais-etiqueta">${est.pais} #${est.numero}</p>
                <p><strong>${est.nombre}</strong></p>
                <!-- Botón de acción para intercambios -->
                <button class="btn-quitar" onclick="quitarEstampa(${index})">
                    ${est.cantidad > 1 ? 'Intercambiar (Quitar 1)' : 'Eliminar Estampa'}
                </button>
            </div>
        `;
        listaEstampas.appendChild(tarjeta);
    });
}

window.quitarEstampa = function (index) {
    if (album[index].cantidad > 1) {

        album[index].cantidad--;
    } else {

        const confirmar = confirm("Es tu última estampa de este jugador. ¿Deseas eliminarla por completo?");
        if (confirmar) {
            album.splice(index, 1);
        }
    }
    guardarYRefrescar();
};

buscador.addEventListener('input', (e) => {
    const filtro = e.target.value.toLowerCase();
    const tarjetas = document.querySelectorAll('.tarjeta-estampa');

    tarjetas.forEach(tarjeta => {
        const texto = tarjeta.innerText.toLowerCase();
        tarjeta.style.display = texto.includes(filtro) ? "block" : "none";
    });
});


function guardarYRefrescar() {
    localStorage.setItem('miAlbumEstampas', JSON.stringify(album));
    actualizarAlbum();
}

function limpiarFormulario() {
    document.getElementById('nombre').value = "";
    document.getElementById('numero').value = "";
    document.getElementById('pais').value = "";
    fotoCapturada = null;

    listaEstampas.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
