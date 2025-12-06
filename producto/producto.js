// ================================================================
// History Keepers — Lógica de Exhibición de Producto
// ================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "/index.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/products/${id}`);
    if (!res.ok) throw new Error("Pieza no encontrada");
    const product = await res.json();
    renderProduct(product);
  } catch (error) {
    console.error(error);
    document.querySelector("main").innerHTML = `
      <div style="text-align:center; padding:100px;">
        <h2>Pieza no disponible.</h2>
        <a href="/index.html" style="text-decoration:underline;">Volver al Inicio</a>
      </div>`;
  }
});

function renderProduct(p) {
  document.getElementById("product-view").hidden = false;
  
  // Meta Info
  document.title = `${p.name} | History Keepers`;
  document.getElementById("p-title").textContent = p.name;
  document.getElementById("p-category").textContent = p.category;
  
  // Breadcrumb
  document.getElementById("bc-cat").textContent = p.category || 'Catálogo';
  document.getElementById("bc-name").textContent = p.name;

  // Description & Highlights
  document.getElementById("p-desc").textContent = p.description || "Sin descripción disponible.";

  const highlightsContainer = document.getElementById("p-highlights");
  highlightsContainer.innerHTML = highlights.map(h => `
    <li><strong>${h.label}:</strong> <span>${h.value}</span></li>
  `).join("");

  // Gallery Logic
  const images = (p.images && p.images.length) ? p.images : ['https://placehold.co/600x800?text=No+Image'];
  const mainImg = document.getElementById("p-main");
  const thumbsContainer = document.getElementById("p-thumbs");

  // Set Main Image
  mainImg.src = images[0];

  // Render Thumbs
  if (images.length > 1) {
    thumbsContainer.innerHTML = images.map((img, idx) => `
      <button class="thumb-btn ${idx === 0 ? 'active' : ''}" onclick="setMainImage('${img}', this)">
        <img src="${img}" alt="Thumb ${idx + 1}" />
      </button>
    `).join("");
  } else {
    thumbsContainer.innerHTML = ''; // Hide thumbs if single image
  }
}

// Global function for thumb click (simple approach)
window.setMainImage = (src, btn) => {
  document.getElementById("p-main").src = src;
  document.querySelectorAll(".thumb-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
};