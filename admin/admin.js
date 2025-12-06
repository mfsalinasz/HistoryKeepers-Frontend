// ================================================================
// History Keepers — Admin Logic (CRUD)
// ================================================================

let products = [];
let editingId = null;

document.addEventListener("DOMContentLoaded", loadCollection);

const form = document.getElementById("add-form");
const tableBody = document.getElementById("inventory-list");
const formTitle = document.getElementById("form-title");
const formBtn = form.querySelector("button[type='submit']");

// ----------------------------------------------------------------
// 1. READ
// ----------------------------------------------------------------
async function loadCollection() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        products = Array.isArray(data) ? data : (data.items || []);
        renderTable(products);
    } catch (e) {
        console.error("Error cargando colección", e);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error de conexión</td></tr>`;
    }
}

function renderTable(items) {
    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">El archivo está vacío.</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => `
        <tr>
            <td><img src="${(item.images && item.images[0]) || ''}" class="thumb"></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td>${item.price || 'N/A'}</td> 
            <td>
                <button data-id="${item._id}" class="btn-small btn-edit" style="margin-right:5px;">Editar</button>
                <button data-id="${item._id}" class="btn-small btn-red btn-delete">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// ----------------------------------------------------------------
// 2. EVENT DELEGATION (EDIT / DELETE)
// ----------------------------------------------------------------
tableBody.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("btn-delete")) {
        deletePiece(id);
    } else if (e.target.classList.contains("btn-edit")) {
        startEdit(id);
    }
});

// ----------------------------------------------------------------
// 3. CREATE & UPDATE
// ----------------------------------------------------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const payload = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        price: document.getElementById("year").value, // Using price field for "Year"
        description: document.getElementById("desc").value,
        stock: 1, 
        images: [] // Image handling omitted for simplicity (mock)
    };

    try {
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/products/${editingId}` : '/api/products';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(editingId ? "Pieza actualizada." : "Pieza catalogada.");
            resetForm();
            loadCollection();
        } else {
            throw new Error("Error en la solicitud");
        }
    } catch (err) {
        alert("Error al guardar cambios.");
    }
});

// ----------------------------------------------------------------
// 4. HELPERS
// ----------------------------------------------------------------
function startEdit(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    editingId = id;
    
    // Populate Form
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category || "";
    document.getElementById("year").value = product.price || "";
    document.getElementById("desc").value = product.description || "";

    // Change UI
    formTitle.textContent = "Editar Pieza del Archivo";
    formBtn.textContent = "Actualizar Pieza";
    formTitle.scrollIntoView({ behavior: 'smooth' });
}

async function deletePiece(id) {
    if(!confirm("¿Retirar esta pieza de la colección permanente?")) return;
    try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadCollection();
    } catch(e) {
        alert("No se pudo eliminar.");
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Ingresar Nueva Pieza al Archivo";
    formBtn.textContent = "Guardar en Archivo";
}