document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Validación porque si no hay ID se regresar al inicio
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
    
    document.querySelector("main").innerHTML = `
      <div style="text-align:center; padding:100px;">
        <h2>Pieza no disponible o no encontrada.</h2>
        <p style="color:#777; margin-bottom:20px;">Es posible que haya sido retirada del archivo.</p>
        <a href="../index.html" class="btn btn-primary" style="max-width:200px; margin:0 auto;">Volver al Museo</a>
      </div>`;
  }
});

function renderProduct(p) {
  //Mostrar la vista
  document.getElementById("product-view").hidden = false;
  
  //Meta Información
  document.title = `${p.name} | History Keepers`;
  document.getElementById("p-title").textContent = p.name;
  document.getElementById("p-category").textContent = p.category || 'Archivo';
  
  // Breadcrumb
  const bcCat = document.getElementById("bc-cat");
  if(bcCat) bcCat.textContent = p.category || 'Catálogo';
  
  document.getElementById("bc-name").textContent = p.name;

  //Descripción
  document.getElementById("p-desc").textContent = p.description || "Sin descripción histórica disponible para esta pieza.";

  // Para la limpieza de la lista de highlights
  const highlights = document.getElementById("p-highlights");
  if(highlights) highlights.innerHTML = "";

  //Para la imagen
  const mainImg = document.getElementById("p-main");
  const thumbsContainer = document.getElementById("p-thumbs");

  // Asignamos la URL de Cloudinary o un placeholder por si falla
  mainImg.src = p.imageUrl || 'https://placehold.co/600x800?text=Sin+Imagen';
  mainImg.alt = `Fotografía de ${p.name}`;

  //Vaciamos el contenedor de miniaturas para que no estorbe
  if(thumbsContainer) thumbsContainer.innerHTML = ''; 
}

// Función global para cambiar imagenes 
window.setMainImage = (src, btn) => {
  document.getElementById("p-main").src = src;
  document.querySelectorAll(".thumb-btn").forEach(b => b.classList.remove("active"));
  if(btn) btn.classList.add("active");
};