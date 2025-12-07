// ================================================================
// History Keepers — Lógica de Exhibición de Producto
// ================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Validación: Si no hay ID, regresar al inicio
  if (!id) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(`https://historykeepers-backend-production.up.railway.app/api/products/${id}`);
    
    if (!res.ok) throw new Error("Pieza no encontrada");
    
    const product = await res.json();
    renderProduct(product);

  } catch (error) {
    console.error(error);
    // UI de Error amigable
    document.querySelector("main").innerHTML = `
      <div style="text-align:center; padding:100px;">
        <h2>Pieza no disponible o no encontrada.</h2>
        <p style="color:#777; margin-bottom:20px;">Es posible que haya sido retirada del archivo.</p>
        <a href="../index.html" class="btn btn-primary" style="max-width:200px; margin:0 auto;">Volver al Museo</a>
      </div>`;
  }
});

function renderProduct(p) {
  // Mostrar la vista (estaba oculta mientras cargaba)
  document.getElementById("product-view").hidden = false;
  
  // 1. Meta Información (Título de pestaña y breadcrumbs)
  document.title = `${p.name} | History Keepers`;
  document.getElementById("p-title").textContent = p.name;
  document.getElementById("p-category").textContent = p.category || 'Archivo';
  
  // Breadcrumb (Navegación superior)
  const bcCat = document.getElementById("bc-cat");
  if(bcCat) bcCat.textContent = p.category || 'Catálogo';
  
  document.getElementById("bc-name").textContent = p.name;

  // 2. Descripción
  document.getElementById("p-desc").textContent = p.description || "Sin descripción histórica disponible para esta pieza.";

  // Limpiamos la lista de "highlights" si existía, ya que no la usamos en este modelo simple
  const highlights = document.getElementById("p-highlights");
  if(highlights) highlights.innerHTML = "";

  // 3. IMAGEN (El cambio más importante)
  const mainImg = document.getElementById("p-main");
  const thumbsContainer = document.getElementById("p-thumbs");

  // Asignamos la URL de Cloudinary o un placeholder si falla
  mainImg.src = p.imageUrl || 'https://placehold.co/600x800?text=Sin+Imagen';
  mainImg.alt = `Fotografía de ${p.name}`;

  // En modo museo (1 foto), vaciamos el contenedor de miniaturas para que no estorbe
  if(thumbsContainer) thumbsContainer.innerHTML = ''; 
}

// Función global para cambiar imagen (se mantiene por si en el futuro agregas más fotos)
window.setMainImage = (src, btn) => {
  document.getElementById("p-main").src = src;
  document.querySelectorAll(".thumb-btn").forEach(b => b.classList.remove("active"));
  if(btn) btn.classList.add("active");
};