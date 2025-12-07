const CLOUD_NAME = "dr1bjk9xk";
const UPLOAD_PRESET = "HistoryKeepers";

let products = [];
let editingId = null;

// Elementos del DOM
const modal = document.getElementById("product-modal");
const form = document.getElementById("add-form");
const tableBody = document.getElementById("inventory-list");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("btn-save");
const previewImg = document.getElementById("preview-img");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    loadCollection();
    
    // Botón Agregar (Abre modal limpio)
    document.getElementById("btn-open-add").onclick = () => openModal();
    
    // Botón Cerrar (X)
    document.getElementById("btn-close-modal").onclick = () => closeModal();
});

// ----------------------------------------------------------------
// 1. CARGA DE DATOS
// ----------------------------------------------------------------
async function loadCollection() {
    try {
        const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/products');
        products = await res.json();
        renderTable(products);
    } catch (e) {
        console.error("Error cargando colección", e);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error de conexión.</td></tr>`;
    }
}

function renderTable(items) {
    if(items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">El inventario está vacío.</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.imageUrl || 'https://placehold.co/100'}" class="thumb"></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td style="text-align:center;">
                <button onclick="editPiece(${item.id})" class="btn-small btn-edit">Editar</button>
                <button onclick="deletePiece(${item.id})" class="btn-small btn-red">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// ----------------------------------------------------------------
// 2. LÓGICA DE MODAL (ABRIR / CERRAR)
// ----------------------------------------------------------------
function openModal(item = null) {
    form.reset();
    previewImg.classList.add("hidden");
    
    if (item) {
        // MODO EDICIÓN
        editingId = item.id;
        modalTitle.textContent = "Editar Pieza";
        
        document.getElementById("name").value = item.name;
        document.getElementById("category").value = item.category;
        document.getElementById("desc").value = item.description;
        document.getElementById("image-url").value = item.imageUrl;

        // Mostrar foto actual
        if(item.imageUrl) {
            previewImg.src = item.imageUrl;
            previewImg.classList.remove("hidden");
        }
    } else {
        // MODO CREAR
        editingId = null;
        modalTitle.textContent = "Ingresar Nueva Pieza";
        document.getElementById("image-url").value = "";
    }

    modal.showModal();
}

window.closeModal = () => {
    modal.close();
    form.reset();
    editingId = null;
};

// ----------------------------------------------------------------
// 3. GUARDAR (CREAR O EDITAR)
// ----------------------------------------------------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById("file-upload");
    
    // Validación: Si es NUEVO y no hay foto, error.
    // Si es EDICIÓN y no hay foto, está bien (usamos la vieja).
    if (!editingId && fileInput.files.length === 0) {
        alert("Debes seleccionar una fotografía para una pieza nueva.");
        return;
    }

    try {
        const originalBtnText = saveBtn.textContent;
        saveBtn.textContent = "Procesando...";
        saveBtn.disabled = true;

        let finalImageUrl = document.getElementById("image-url").value;

        // Si el usuario seleccionó un archivo nuevo, lo subimos
        if (fileInput.files.length > 0) {
            saveBtn.textContent = "Subiendo imagen...";
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("upload_preset", UPLOAD_PRESET);

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });
            const imageData = await cloudinaryRes.json();
            finalImageUrl = imageData.secure_url;
        }

        // Preparamos los datos para Neon
        const payload = {
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            description: document.getElementById("desc").value,
            imageUrl: finalImageUrl 
        };

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId 
            ? `https://historykeepers-backend-production.up.railway.app/api/products/${editingId}` 
            : 'https://historykeepers-backend-production.up.railway.app/api/products';

        const serverRes = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (serverRes.ok) {
            closeModal();
            loadCollection();
            alert(editingId ? "Pieza actualizada." : "Pieza creada exitosamente.");
        } else {
            throw new Error("Error guardando en base de datos");
        }

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    } finally {
        saveBtn.textContent = "Guardar Cambios";
        saveBtn.disabled = false;
    }
});

// ----------------------------------------------------------------
// 4. ACCIONES (EDITAR / ELIMINAR)
// ----------------------------------------------------------------
window.editPiece = (id) => {
    const item = products.find(p => p.id === id);
    if (item) openModal(item);
};

window.deletePiece = async (id) => {
    if(!confirm("¿Estás seguro de retirar esta pieza del archivo? Esta acción no se puede deshacer.")) return;
    try {
        await fetch(`https://historykeepers-backend-production.up.railway.app/api/products/${id}`, { method: 'DELETE' });
        loadCollection();
    } catch(e) {
        alert("Error al eliminar.");
    }
};