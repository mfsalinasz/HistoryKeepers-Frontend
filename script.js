document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    wireAuthForms();
    wireSearch();
    buildMenu();
    
    window.addEventListener("scroll", toggleBackToTop);
});

async function loadProducts(query = "") {
    const container = document.querySelector(".content");
    
    if(!query) container.innerHTML = '<div style="text-align:center; padding:40px;">Cargando archivo...</div>';
  
    try {
        const res = await fetch('https://historykeepers-backend-production.up.railway.app/api/products');
        if (!res.ok) throw new Error("Error de conexión");
        
        const data = await res.json();
        let items = Array.isArray(data) ? data : (data.items || []);
  
        if (query) {
            const q = query.toLowerCase();
            items = items.filter(i => 
                i.name.toLowerCase().includes(q) || 
                (i.category && i.category.toLowerCase().includes(q))
            );
            setActive('catalogo');
        }
  
        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px;">
                    <h3>No se encontraron piezas.</h3>
                    <p>Intenta con otro término de búsqueda.</p>
                    ${query ? '<button class="btn-primary" onclick="loadProducts()" style="max-width:200px; margin:20px auto;">Ver Todo</button>' : ''}
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
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align:center; color:red;">Error al conectar con el archivo histórico.</p>`;
    }
}

function wireSearch() {
   const searchInput = document.getElementById("search-box");
   const searchBtn = document.getElementById("btn-search-icon");

   if (!searchInput || !searchBtn) return;

   searchBtn.addEventListener("click", (e) => {
       e.preventDefault();
       loadProducts(searchInput.value.trim());
   });
}

function wireAuthForms() {
    const loginBtn = document.querySelector('[data-open="login"]');
    const loginDialog = document.getElementById("dlg-login");
    const submitBtn = document.getElementById("btn-login-submit");

    if (loginBtn && loginDialog) {
        loginBtn.addEventListener("click", () => loginDialog.showModal());
    }

    if (submitBtn) {
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
             } finally {
                 submitBtn.textContent = originalText;
                 submitBtn.disabled = false;
             }
        });
    }

    if (loginDialog) {
        loginDialog.addEventListener("click", e => {
            if (e.target === loginDialog) loginDialog.close();
        });
    }
}

function toggleBackToTop() {
    const btn = document.getElementById("btn-back-to-top");
    if (!btn) return;
    
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
    
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
    a.addEventListener("click", e => {
      e.preventDefault();
      setActive(a.dataset.key);
    });
  });

  setActive("inicio");
}

window.setActive = (key) => {
  document.querySelectorAll("nav.menu a").forEach(link => {
    link.classList.toggle("active", link.dataset.key === key);
  });

  document.getElementById("view-inicio").classList.add("hidden");
  document.getElementById("view-catalogo").classList.add("hidden");

  const target = document.getElementById(`view-${key}`);
  if (target) target.classList.remove("hidden");
};