// URL base del backend para usuarios
const URL_API_USUARIOS = "http://localhost:8080/api/usuarios";

let usuarios = [];
let idEditando = null;

// Elementos del DOM
const modal = document.getElementById("usuario-modal");
const formulario = document.getElementById("form-usuario");
const cuerpoTabla = document.getElementById("lista-usuarios");
const tituloModal = document.getElementById("titulo-modal");
const botonGuardar = document.getElementById("btn-guardar");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
    document.getElementById("btn-abrir-agregar").onclick = () => abrirModal();
    document.getElementById("btn-cerrar-modal").onclick = () => cerrarModal();
});

//Función para cargar a los usuarios que tenemos
async function cargarUsuarios() {
    try {
        const respuesta = await fetch(URL_API_USUARIOS);
        usuarios = await respuesta.json();
        pintarTabla(usuarios);
    } catch (error) {
        console.error("Error cargando usuarios", error);
        cuerpoTabla.innerHTML = `
        <tr>
            <td colspan="5" style="color:red; text-align:center;">
                Error de conexión.
            </td>
        </tr>`;
    }
}

function pintarTabla(lista) {
    if (lista.length === 0) {
        cuerpoTabla.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding:20px;">
                No hay usuarios registrados.
            </td>
        </tr>`;
        return;
    }

    cuerpoTabla.innerHTML = lista.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td><strong>${usuario.username}</strong></td>
            <td>${usuario.correo || ""}</td>
            <td>${usuario.nombreCompleto || ""}</td>
            <td style="text-align:center;">
                <button onclick="editarUsuario(${usuario.id})" class="btn-small btn-edit">Editar</button>
                <button onclick="eliminarUsuario(${usuario.id})" class="btn-small btn-red">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

//Para abrir el modal
function abrirModal(usuario = null) {
    formulario.reset();

    if (usuario) {
        idEditando = usuario.id;
        tituloModal.textContent = "Editar usuario";

        document.getElementById("campo-username").value = usuario.username || "";
        document.getElementById("campo-password").value = usuario.password || "";
        document.getElementById("campo-correo").value = usuario.correo || "";
        document.getElementById("campo-nombre-completo").value = usuario.nombreCompleto || "";
    } else {
        idEditando = null;
        tituloModal.textContent = "Nuevo usuario";
    }

    modal.showModal();
}

window.cerrarModal = () => {
    modal.close();
    formulario.reset();
    idEditando = null;
};

//Guardar usuario y tambien editar

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
        const textoOriginal = botonGuardar.textContent;
        botonGuardar.textContent = "Guardando...";
        botonGuardar.disabled = true;

        const payload = {
            username: document.getElementById("campo-username").value,
            password: document.getElementById("campo-password").value,
            correo: document.getElementById("campo-correo").value,
            nombreCompleto: document.getElementById("campo-nombre-completo").value
        };

        const metodo = idEditando ? "PUT" : "POST";
        const url = idEditando
            ? `${URL_API_USUARIOS}/${idEditando}`
            : URL_API_USUARIOS;

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (respuesta.ok) {
            cerrarModal();
            await cargarUsuarios();
            alert(idEditando ? "Usuario actualizado." : "Usuario creado correctamente.");
        } else {
            throw new Error("Error al guardar el usuario en la base de datos.");
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        botonGuardar.textContent = "Guardar Cambios";
        botonGuardar.disabled = false;
    }
});


window.editarUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) abrirModal(usuario);
};

// Eliminar usuario
window.eliminarUsuario = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;

    try {
        const respuesta = await fetch(`${URL_API_USUARIOS}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el usuario.");
        }

        await cargarUsuarios();
        alert("Usuario eliminado correctamente.");
    } catch (error) {
        console.error(error);
        alert("Error al eliminar el usuario.");
    }
};
