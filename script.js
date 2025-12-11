// cuando la página termina de cargar jalamos todo lo necesario
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    wireAuthForms();
    wireSearch();
    buildMenu();
});

// función que trae los productos del backend y arma las tarjetas del catálogo
// Variable global para guardar los productos traídos del Backend
let allProductsData = [];

// 1. Modificamos loadProducts para que guarde los datos y genere los filtros
async function loadProducts(query = "") {
    const container = document.querySelector(".content");
    
    // Si es la primera carga (sin búsqueda), mostramos loading
    if(!query && allProductsData.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Cargando archivo...</div>';
    }
  
    try {
        // Hacemos la petición al Backend una sola vez si no tenemos datos
        if (allProductsData.length === 0) {
            const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/products');
            if (!res.ok) throw new Error("Error de conexión");
            const data = await res.json();
            allProductsData = Array.isArray(data) ? data : (data.items || []);
            
            // Una vez que tenemos los datos del Back, generamos los botones de categorías
            generateCategoryButtons(); 
        }

        // Trabajamos con la variable local 'items' para filtrar
        let items = [...allProductsData];
  
        // Si hay una búsqueda por texto (desde la lupa), filtramos
        if (query) {
            const q = query.toLowerCase();
            items = items.filter(i => 
                i.name.toLowerCase().includes(q) || 
                (i.category && i.category.toLowerCase().includes(q))
            );
            setActive('catalogo');
        }
  
        renderGrid(items, container);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align:center; color:red;">Error al conectar con el archivo histórico.</p>`;
    }
}

// 2. Nueva Función: Genera los botones dinámicamente basándose en lo que hay en la BD
function generateCategoryButtons() {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    // Extraemos las categorías únicas de los productos que llegaron del Backend
    const categories = ['Todos', ...new Set(allProductsData.map(p => p.category).filter(Boolean))];

    filterContainer.innerHTML = categories.map(cat => `
        <button 
            class="btn-filter" 
            onclick="filterByCategory('${cat}')"
            style="padding: 8px 16px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 20px; transition: all 0.3s;"
            onmouseover="this.style.background='#eee'"
            onmouseout="this.style.background='white'"
        >
            ${cat}
        </button>
    `).join('');
}

// 3. Nueva Función: Se activa al hacer click en un botón de categoría
function filterByCategory(category) {
    const container = document.querySelector(".content");
    
    let filteredItems;

    if (category === 'Todos') {
        filteredItems = allProductsData;
    } else {
        // Filtramos usando el campo 'category' que viene de tu Product.java
        filteredItems = allProductsData.filter(item => item.category === category);
    }

    renderGrid(filteredItems, container);
}

// 4. Función auxiliar para pintar las tarjetas (refactorización para no repetir código)
function renderGrid(items, container) {
    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px;">
                <h3>No se encontraron piezas.</h3>
                <p>Intenta con otra categoría o término.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${items.map(item => `
                <div class="product-card" onclick="window.location.href='producto/producto.html?id=${item.id}'">
                    <div class="pc-media">
                        <img src="${item.imageUrl || 'https://placehold.co/400x500?text=Sin+Imagen'}" alt="${item.name}" class="pc-img">
                        <span class="pc-badge">${item.category || 'Archivo'}</span>
                    </div>
                    <div class="pc-body">
                        <div class="pc-title">${item.name}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// función para conectar el buscador con el filtrado del catálogo
function wireSearch() {
   const searchInput = document.getElementById("search-box");
   const searchBtn = document.getElementById("btn-search-icon");

   if (!searchInput || !searchBtn) return;

   searchBtn.addEventListener("click", (e) => {
       e.preventDefault();
       loadProducts(searchInput.value.trim());
   });
}

// función que arma el modal de login y manda la petición de inicio de sesión al backend
function wireAuthForms() {
    const loginBtn = document.querySelector('[data-open="login"]');
    const loginDialog = document.getElementById("dlg-login");
    const submitBtn = document.getElementById("btn-login-submit");

    if (loginBtn && loginDialog) {
        // abre el modal cuando le pican al botón de staff
        loginBtn.addEventListener("click", () => loginDialog.showModal());
    }

    if (submitBtn) {
        // aquí se manda la petición de login al servidor y según el usuario se redirige
        submitBtn.addEventListener("click", async () => {
            const emailVal = document.getElementById("log-email").value;
            const passVal = document.getElementById("log-password").value;
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Verificando...";
            submitBtn.disabled = true;

            try {
                const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: emailVal, password: passVal })
                });

                if (res.ok) {
                    // leemos los datos que regresa el backend (message, userId, username, etc.)
                    const datos = await res.json();

                    // guardamos banderas/básicos en localStorage
                    localStorage.setItem("hk_admin_session", "true");
                    localStorage.setItem("hk_admin_username", datos.username);
                    localStorage.setItem("hk_admin_id", datos.userId);

                    // limpiamos campos del formulario
                    document.getElementById("log-email").value = "";
                    document.getElementById("log-password").value = "";

                    
                    if (datos.username === "Superadmin") {
                        window.location.href = "superadmin/superadmin.html";
                    } else {
                        
                        window.location.href = "admin/admin.html";
                    }
                } else {
                    alert("Credenciales incorrectas");
                }
            } catch (e) {
                console.error(e);
                alert("Error de conexión con el servidor");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    if (loginDialog) {
        // cierra el modal si le das click fuera de la tarjeta
        loginDialog.addEventListener("click", e => {
            if (e.target === loginDialog) loginDialog.close();
        });
    }
}

// función que arma el menú de Inicio y Archivo Histórico y conecta los eventos
function buildMenu() {
  const nav = document.querySelector("nav.menu");
  if (!nav) return;

  const items = [
    { key: "inicio",   label: "Inicio" },
    { key: "catalogo", label: "Archivo Histórico" }
  ];

  nav.innerHTML = `<ul>
    ${items.map(i => `<li><a href="#" data-key="${i.key}">${i.label}</a></li>`).join("")}
  </ul>`;

  nav.querySelectorAll("a").forEach(a => {
    // cada click cambia la vista activa sin recargar la página
    a.addEventListener("click", e => {
      e.preventDefault();
      setActive(a.dataset.key);
    });
  });

  setActive("inicio");
}

// función global para cambiar entre la vista de inicio y la del catálogo
window.setActive = (key) => {
  document.querySelectorAll("nav.menu a").forEach(link => {
    link.classList.toggle("active", link.dataset.key === key);
  });

  document.getElementById("view-inicio").classList.add("hidden");
  document.getElementById("view-catalogo").classList.add("hidden");

  const target = document.getElementById(`view-${key}`);
  if (target) target.classList.remove("hidden");
};
