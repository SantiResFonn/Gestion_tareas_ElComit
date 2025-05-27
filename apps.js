document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnLogin").addEventListener("click", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (email === "" || password === "") {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Verificar si es el administrador
        if (email === "admin@admin" && password === "12345678") {
            const admin = {
                nombre: "Administrador",
                correo: email,
                rol: "admin"
            };
            localStorage.setItem("usuarioActivo", JSON.stringify(admin));
            alert("Inicio de sesión como administrador exitoso.");
            window.location.href = "interfaz_admin.html";
            return;
        }

        const users = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = users.find(user => user.correo === email);

        if (!usuario) {
            alert("El usuario no está registrado.");
            return;
        }

        if (usuario.password !== password) {
            alert("Contraseña incorrecta.");
            return;
        }

        // Guardar sesión activa
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

        alert("Inicio de sesión exitoso.");
        window.location.href = "gestion-tareas.html";
    });
});



document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.querySelector('form');
    const selectAsignado = document.getElementById('asignado');

    // Cargar usuarios en el <select>
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.identificacion; // identificador único
        option.textContent = usuario.nombre;
        selectAsignado.appendChild(option);
    });

    document.getElementById('btnTask').addEventListener('click', function () {

        // Capturar valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const prioridad = document.getElementById('prioridad').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const asignado = document.getElementById('asignado').value;

        // Validación mínima
        if (!nombre || !documento || !correo || !prioridad || !descripcion || !asignado) {
            alert("⚠️ Por favor, complete todos los campos.");
            return;
        }

        // Crear solicitud
        const solicitud = {
            nombre,
            documento,
            correo,
            prioridad,
            descripcion,
            fecha: new Date().toLocaleString()
        };

        // Buscar usuario asignado
        const indexUsuario = usuarios.findIndex(u => u.identificacion === asignado);

        if (indexUsuario !== -1) {
            if (!Array.isArray(usuarios[indexUsuario].pendientes)) {
                usuarios[indexUsuario].pendientes = [];
            }

            usuarios[indexUsuario].pendientes.push(solicitud);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            alert("✅ Solicitud enviada y asignada con éxito");
            setTimeout(function () {
                location.reload();  
            }, 1000);
        } else {
            alert("❌ Usuario asignado no encontrado.");
        }
    });
});



function cargarTareas() {
    const tabla = document.getElementById('tablaTareas');
    if (!tabla) return;

    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) return;

    tabla.innerHTML = ''; // Limpiar tabla

    const solicitudes = usuarioActivo.pendientes || [];

    solicitudes.forEach((solicitud, index) => {
        const fila = document.createElement('tr');

        // Acumulador para "Tarea 1", "Tarea 2", ...
        const numeroTarea = `Tarea ${index + 1}`;

        // Mensaje de urgencia si la prioridad es "Urgente"
        const alertaUrgente = solicitud.prioridad.toLowerCase() === "urgente"
            ? `
                <div style="margin-top: 5px; display: flex; align-items: center; gap: 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/463/463612.png" width="20" height="20" alt="Alerta">
                    <span style="color: #B80000; font-weight: bold;">Se requiere con urgencia</span>
                </div>
            `
            : '';

        fila.innerHTML = `
            <td style="color: #4A6B95; background-color: #D1E9F1">${numeroTarea}</td>
            <td style="color: #4A6B95; background-color: #D1E9F1" id="descripcion-${index}">${solicitud.descripcion}</td>
            <td style="color: #4A6B95; background-color: #D1E9F1"><span class="badge bg-success">Pendiente</span></td>
            <td style="color: #4A6B95; background-color: #D1E9F1">${new Date().toLocaleDateString()}</td>
            <td style="color: #4A6B95; background-color: #D1E9F1">${solicitud.prioridad}</td>
            <td style="color: #4A6B95; background-color: #D1E9F1">${solicitud.nombre}</td>
            <td style="color: #4A6B95; background-color: #D1E9F1">
                <button class="btn btn-sm btn-outline-primary" onclick="editarTarea(${index})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarea(${index})">Eliminar</button>
                <button style="background-color: #9CD442" class="btn btn-sm" onclick="completarTarea(${index})">Completar</button>
                <button style="background-color: #003366; color: white;" class="btn btn-sm" onclick="notificarTarea(${index})">Notificar</button>
                ${alertaUrgente}
            </td>
        `;
        tabla.appendChild(fila);
    });
}





function editarTarea(index) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    const nuevaDescripcion = prompt('Editar descripción de la tarea', usuarioActivo.pendientes[index].descripcion);
    if (!nuevaDescripcion) return;

    usuarioActivo.pendientes[index].descripcion = nuevaDescripcion;

    const i = usuarios.findIndex(u => u.correo === usuarioActivo.correo);
    usuarios[i] = usuarioActivo;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
    location.reload();
}


function eliminarTarea(index) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    usuarioActivo.pendientes.splice(index, 1);

    const i = usuarios.findIndex(u => u.correo === usuarioActivo.correo);
    usuarios[i] = usuarioActivo;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
    location.reload();
}


function completarTarea(index) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    const completadas = JSON.parse(localStorage.getItem("solicitudesCompletadas")) || [];

    const tarea = usuarioActivo.pendientes.splice(index, 1)[0];
    tarea.estado = 'Completada';
    usuarioActivo.completadas = usuarioActivo.completadas || [];
    usuarioActivo.completadas.push(tarea);

    completadas.push(tarea); // para que se visualice en solicitudes-completadas.html

    const i = usuarios.findIndex(u => u.correo === usuarioActivo.correo);
    usuarios[i] = usuarioActivo;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
    localStorage.setItem("solicitudesCompletadas", JSON.stringify(completadas));

    window.location.href = "solicitudes-completadas.html";
}

function notificarTarea(index) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo || !usuarioActivo.pendientes || !usuarioActivo.pendientes[index]) return;

    const solicitud = usuarioActivo.pendientes[index];
    alert(`Modificaciones a la solicitud notificada a ${solicitud.correo}`);
}



document.addEventListener("DOMContentLoaded", function () {
    const btnRegister = document.getElementById("btnRegister");
    const form = document.getElementById("registroForm");

    if (!btnRegister) {
        console.error("No se encontró el botón btnRegister");
        return;
    }

    btnRegister.addEventListener("click", function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const rol = document.getElementById('rol').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;
        const mensaje = document.getElementById('mensaje');

        if (!nombre || !identificacion || !rol || !correo || !password) {
            mensaje.textContent = 'Todos los campos son obligatorios';
            mensaje.style.color = 'red';
            return;
        }

        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correo)) {
            mensaje.textContent = 'El correo electrónico no es válido';
            mensaje.style.color = 'red';
            return;
        }

        const usuario = {
            nombre,
            identificacion,
            rol,
            pendientes: [],
            completadas: [],
            correo,
            password
        };

        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        const existeCorreo = usuarios.some(u => u.correo === correo);
        if (existeCorreo) {
            mensaje.textContent = 'Este correo ya está registrado';
            mensaje.style.color = 'red';
            return;
        }

        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        mensaje.style.color = 'green';
        mensaje.textContent = 'Usuario registrado exitosamente';

        form.reset(); // ← esto sí resetea el formulario
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioSelect = document.getElementById("usuarioSelect");
    const infoUsuario = document.getElementById("infoUsuario");
    const graficoTareas = document.getElementById("graficoTareas").getContext("2d");
    let chart;

    // Llenar el menú desplegable con los usuarios
    usuarios.forEach((usuario, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = usuario.nombre;
        usuarioSelect.appendChild(option);
    });

    usuarioSelect.addEventListener("change", () => {
        const selectedIndex = usuarioSelect.value;
        if (selectedIndex === "") {
            infoUsuario.innerHTML = "";
            if (chart) chart.destroy();
            return;
        }

        const usuario = usuarios[selectedIndex];
        mostrarInfoUsuario(usuario);
        generarGrafico(usuario);
    });

    function mostrarInfoUsuario(usuario) {
        const completadasEsteMes = contarTareasEsteMes(usuario.completadas);
        infoUsuario.innerHTML = `
            <p><strong>Nombre:</strong> ${usuario.nombre}</p>
            <p><strong>Rol:</strong> ${usuario.rol}</p>

            <p><strong>Tareas Pendientes:</strong> ${usuario.pendientes.length}</p>
            <p><strong>Tareas Completadas:</strong> ${usuario.completadas.length}</p>
            <p><strong>Tareas Completadas Este Mes:</strong> ${completadasEsteMes}</p>
        `;
    }

    function generarGrafico(usuario) {
        const datos = obtenerDatosPorMes(usuario);
        const labels = Object.keys(datos);
        const pendientes = labels.map(mes => datos[mes].pendientes);
        const completadas = labels.map(mes => datos[mes].completadas);

        if (chart) chart.destroy();

        chart = new Chart(graficoTareas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Pendientes',
                        data: pendientes,
                        backgroundColor: '#4A6B95'
                    },
                    {
                        label: 'Completadas',
                        data: completadas,
                        backgroundColor: '#003366'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tareas por Mes'
                    }
                }
            }
        });
    }

    function obtenerDatosPorMes(usuario) {
        const datos = {};

        usuario.pendientes.forEach(tarea => {
            const mes = obtenerMes(tarea.fecha);
            if (!datos[mes]) datos[mes] = { pendientes: 0, completadas: 0 };
            datos[mes].pendientes++;
        });

        usuario.completadas.forEach(tarea => {
            const mes = obtenerMes(tarea.fecha);
            if (!datos[mes]) datos[mes] = { pendientes: 0, completadas: 0 };
            datos[mes].completadas++;
        });

        return datos;
    }

    function obtenerMes(fechaStr) {
        const fecha = new Date(fechaStr);
        const opciones = { month: 'short', year: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    function contarTareasEsteMes(tareas) {
        const ahora = new Date();
        return tareas.filter(tarea => {
            const fecha = new Date(tarea.fecha);
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        }).length;
    }
        // Mostrar botón PDF solo si hay usuario seleccionado
    const btnPDF = document.getElementById("descargarPDF");
    btnPDF.classList.add("d-none");

    usuarioSelect.addEventListener("change", () => {
        const selectedIndex = usuarioSelect.value;
        btnPDF.classList.toggle("d-none", selectedIndex === "");
    });

    btnPDF.addEventListener("click", () => {
        const selectedIndex = usuarioSelect.value;
        if (selectedIndex === "") return;
        const usuario = usuarios[selectedIndex];
        const nombreArchivo = `informe-tareas-${usuario.nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        const elemento = document.getElementById("informeUsuario");
        const opciones = {
            margin:       0.5,
            filename:     nombreArchivo,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opciones).from(elemento).save();
    });

});




