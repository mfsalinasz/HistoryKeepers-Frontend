// ================================================================
// History Keepers — Lógica Principal (Catálogo + Buscador)
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    wireAuthForms();
    wireSearch(); // Buscador activado
    window.addEventListener("scroll", toggleBackToTop);
});

// Verificación de Admin
const isAdmin = () => localStorage.getItem("hk_admin_session") === "true";

// ----------------------------------------------------------------
// 1. Cargar Productos (Con Filtro de Búsqueda)
// ----------------------------------------------------------------
async function loadProducts(query = "") {
    const container = document.querySelector(".content");
    container.innerHTML = '<div style="text-align:center; padding:40px;">Cargando archivo...</div>';
  
    try {
        // Petición al Backend
        const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/products');
        if (!res.ok) throw new Error("Error de conexión");
        
        const data = await res.json();
        let items = Array.isArray(data) ? data : (data.items || []);
  
        // Lógica del Buscador (Filtrado en el navegador)
        if (query) {
            const q = query.toLowerCase();
            items = items.filter(i => 
                i.name.toLowerCase().includes(q) || 
                (i.category && i.category.toLowerCase().includes(q))
            );
        }
  
        // Mostrar mensaje si no hay resultados
        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px;">
                    <h3>No se encontraron piezas.</h3>
                    <p>Intenta con otro término de búsqueda.</p>
                    ${query ? '<button class="btn-primary" onclick="loadProducts()" style="max-width:200px; margin:20px auto;">Ver Todo</button>' : ''}
                </div>`;
            return;
        }
  
        // Renderizar la Cuadrícula
        container.innerHTML = `
            <div class="grid">
                ${items.map(item => createProductCard(item)).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align:center; color:red;">Error al conectar con el archivo histórico.</p>`;
    }
}
  
function createProductCard(item) {
    const imgUrl = item.imageUrl || 'https://placehold.co/400x500?text=Sin+Imagen';
    
    return `
        <div class="product-card" onclick="window.location.href='producto/producto.html?id=${item.id}'">
            <div class="pc-media">
                <img src="${imgUrl}" alt="${item.name}" class="pc-img">
                <span class="pc-badge">${item.category || 'Archivo'}</span>
            </div>
            <div class="pc-body">
                <div class="pc-title">${item.name}</div>
            </div>
        </div>
    `;
}

// ----------------------------------------------------------------
// 2. Lógica del Buscador
// ----------------------------------------------------------------
function wireSearch() {
   const searchInput = document.getElementById("search-box");
   const searchBtn = document.getElementById("btn-search-icon");

   if (!searchInput) return;

   // Opción A: Buscar al presionar "Enter"
   searchInput.addEventListener("keypress", (e) => {
       if (e.key === "Enter") {
           e.preventDefault();
           const term = searchInput.value.trim();
           loadProducts(term); // Llama a la carga con el filtro
       }
   });

   // Opción B: Buscar al hacer clic en la lupa
   if (searchBtn) {
       searchBtn.addEventListener("click", (e) => {
           e.preventDefault();
           const term = searchInput.value.trim();
           loadProducts(term);
       });
   }
   
   searchInput.addEventListener("input", (e) => {
       const term = e.target.value.trim();
       // Pequeño delay para no saturar
       clearTimeout(window.searchTimeout);
       window.searchTimeout = setTimeout(() => loadProducts(term), 300);
   });
}

// ----------------------------------------------------------------
// 3. Autenticación y Admin
// ----------------------------------------------------------------
function wireAuthForms() {
    const loginBtn = document.querySelector('[data-open="login"]');
    const loginDialog = document.getElementById("dlg-login");
    const submitBtn = document.getElementById("btn-login-submit");

    if (loginBtn && loginDialog) {
        loginBtn.addEventListener("click", () => {
            loginDialog.showModal();
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
             const usernameVal = document.getElementById("log-email").value;
             const passwordVal = document.getElementById("log-password").value;
             
             try {
                 const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/auth/login', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ username: usernameVal, password: passwordVal })
                 });

                 if (res.ok) {
                     localStorage.setItem("hk_admin_session", "true");
                     document.getElementById("log-email").value = "";
                     document.getElementById("log-password").value = "";
                     window.location.href = "admin/admin.html";
                 } else {
                     alert("Credenciales incorrectas");
                 }
             } catch(e) {
                 console.error(e);
                 alert("Error de conexión con el servidor");
             }
        });
    }

    // Cerrar modal al hacer click fuera
    document.querySelectorAll("dialog").forEach(d => {
        d.addEventListener("click", e => {
            if (e.target === d) d.close();
        });
    });
}

function toggleBackToTop() {
    const btn = document.getElementById("btn-back-to-top");
    if (!btn) return;
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}