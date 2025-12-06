// ================================================================
// History Keepers — Main Logic (Simple Catalog)
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    wireAuthForms();
    wireSearch();
    updateUIForAuthState();
    window.addEventListener("scroll", toggleBackToTop);
});

// Admin Check
const isAdmin = () => localStorage.getItem("hk_admin_session") === "true";

// ----------------------------------------------------------------
// 1. Load Products (Grid Only)
// ----------------------------------------------------------------
async function loadProducts(query = "") {
    const container = document.querySelector(".content");
    container.innerHTML = '<div style="text-align:center; padding:40px;">Cargando archivo...</div>';
  
    try {
        const res = await fetch('http://localhost:8080/api/products');
        if (!res.ok) throw new Error("Error de conexión");
        
        const data = await res.json();
        let items = Array.isArray(data) ? data : (data.items || []);
  
        // Filter in frontend for simplicity (or use backend query)
        if (query) {
            const q = query.toLowerCase();
            items = items.filter(i => 
                i.name.toLowerCase().includes(q) || 
                (i.category && i.category.toLowerCase().includes(q))
            );
        }
  
        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px;">
                    <h3>No se encontraron piezas.</h3>
                    <p>Intenta con otro término de búsqueda.</p>
                </div>`;
            return;
        }
  
        // Render Grid
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
    const imgUrl = (item.images && item.images[0]) ? item.images[0] : 'https://placehold.co/400x500?text=Sin+Imagen';
    // Price hack for Year if needed
    const yearDisplay = item.price ? `<span class="pc-price">${item.price}</span>` : '';

    return `
        <div class="product-card" onclick="window.location.href='/producto/producto.html?id=${item.id}'">
            <div class="pc-media">
                <img src="${imgUrl}" alt="${item.name}" class="pc-img">
                <span class="pc-badge">${item.category || 'Archivo'}</span>
            </div>
            <div class="pc-body">
                <div class="pc-title">${item.name}</div>
                ${yearDisplay}
            </div>
        </div>
    `;
}

// ----------------------------------------------------------------
// 2. Search Logic
// ----------------------------------------------------------------
function wireSearch() {
   // Assuming there's a search input in a modal or just the button for now
   // The User asked for a "Searcher" (Buscador).
   // index.html has a button that focuses 'search-box', but 'search-box' might be missing.
   // Let's create a dynamic search box behavior if it doesn't exist, or specific input handling.
   
   // For this iteration, let's look for a specific input if it exists, otherwise we might need to add one.
   // The index.html currently has just a button. We should probably pop up a prompt or a modal, 
   // but to keep it simple and clean as requested:
   
   const btn = document.querySelector("button[onclick*='search-box']");
   if(btn) {
       btn.onclick = (e) => {
           e.preventDefault();
           const term = prompt("Buscar en el archivo:"); // Simple native prompt for now to avoid complexity
           if(term) loadProducts(term);
       };
   }
}

// ----------------------------------------------------------------
// 3. Auth & Admin Logic
// ----------------------------------------------------------------
function wireAuthForms() {
    const loginBtn = document.querySelector('[data-open="login"]');
    const loginDialog = document.getElementById("dlg-login");
    const loginForm = document.getElementById("login-form");
    const submitBtn = document.getElementById("btn-login-submit");

    if (loginBtn && loginDialog) {
        loginBtn.addEventListener("click", () => {
            if (isAdmin()) {
                window.location.href = "/admin/admin.html"; // Direct to admin if logged in
            } else {
                loginDialog.showModal();
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
             const email = document.getElementById("log-email").value;
             const pass = document.getElementById("log-password").value;
             
             // Hardcoded Auth for demo
             if (email === "staff@hk.com" && pass === "archive2025") {
                 localStorage.setItem("hk_admin_session", "true");
                 window.location.href = "/admin/admin.html";
             } else {
                 document.getElementById("dlg-login").close();
                 document.getElementById("dlg-login-error").showModal();
             }
        });
    }

    // Modal close on backdrop click
    document.querySelectorAll("dialog").forEach(d => {
        d.addEventListener("click", e => {
            if (e.target === d) d.close();
        });
    });
}

function updateUIForAuthState() {
    const loginBtn = document.querySelector('[data-open="login"]');
    if (loginBtn && isAdmin()) {
        loginBtn.textContent = "PANEL ADMIN";
    }
}

// ----------------------------------------------------------------
// 4. Utilities
// ----------------------------------------------------------------
function toggleBackToTop() {
    const btn = document.getElementById("btn-back-to-top");
    if (!btn) return;
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}