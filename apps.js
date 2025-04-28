document.addEventListener('DOMContentLoaded', function () {
    
    const formulario = document.querySelector('form');

    formulario.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita que el formulario se envíe normalmente

        // Capturar los valores 
        const nombre = document.getElementById('nombre').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const prioridad = document.getElementById('prioridad').value;
        const descripcion = document.getElementById('descripcion').value.trim();

        // Crear el objeto
        const solicitud = {
            nombre: nombre,
            documento: documento,
            prioridad: prioridad,
            descripcion: descripcion
        };

        // Mostrar el JSON
        console.log(JSON.stringify(solicitud, null, 2));
        let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
        solicitudes.push(solicitud);
        localStorage.setItem('solicitudes', JSON.stringify(solicitudes));

        alert("✅ Solicitud enviada con éxito");
        setTimeout(function () {
            window.location.href = 'index.html';
        }, 2000);
    });
});


function cargarTareas() {
    const tabla = document.getElementById('tablaTareas');
    if (tabla) {
        const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];

        solicitudes.forEach((solicitud, index) => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td style="color: #4A6B95 ; background-color: #D1E9F1">Tarea</td>
                <td style="color: #4A6B95; background-color: #D1E9F1" id="descripcion-${index}">${solicitud.descripcion}</td>
                <td style="color: #4A6B95; background-color: #D1E9F1"><span class="badge bg-success">Pendiente</span></td>
                <td style="color: #4A6B95; background-color: #D1E9F1">${new Date().toLocaleDateString()}</td>
                <td style="color: #4A6B95; background-color: #D1E9F1">${solicitud.prioridad}</td>
                <td style="color: #4A6B95; background-color: #D1E9F1">${solicitud.nombre}</td>
                <td style="color: #4A6B95; background-color: #D1E9F1">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarTarea(${index})">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarea(${index})">Eliminar</button>
                    <button style="background-color: #9CD442" class="btn btn-sm" onclick="completarTarea(${index})">Completar</button>
                </td>
            `;

            tabla.appendChild(fila);
        });
    }
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    window.location.href = "gestion-tareas.html";
});

function editarTarea(index) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const nuevaDescripcion = prompt('Editar descripción de la tarea', solicitudes[index].descripcion);
    
    if (nuevaDescripcion) {
        solicitudes[index].descripcion = nuevaDescripcion;
        localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
        cargarTareas();
    }
    location.reload()
}

function eliminarTarea(index) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    solicitudes.splice(index, 1);
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    cargarTareas();
    location.reload()
}

function completarTarea(index) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const tareaCompletada = solicitudes.splice(index, 1)[0];
    tareaCompletada.estado = 'Completada';

    // Guardar en solicitudesCompletadas
    const completadas = JSON.parse(localStorage.getItem('solicitudesCompletadas')) || [];
    completadas.push(tareaCompletada);
    localStorage.setItem('solicitudesCompletadas', JSON.stringify(completadas));
    
    // Actualizar las tareas pendientes
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));

    // Redireccionar a la página de completadas
    window.location.href = "solicitudes-completadas.html";
    location.reload()
}



