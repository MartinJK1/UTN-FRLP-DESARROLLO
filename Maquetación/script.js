// 1. Mostrar mensaje al hacer clic en el botón principal "Reservar Ahora" 
const botonReservar = document.getElementById("btnReservar");

if (botonReservar) {
  botonReservar.addEventListener("click", () => {
    window.location.href = "reserva.html"; // redirige al formulario de turnos
  });
}

// 2. Cambiar el color de fondo del botón al pasar el mouse (hover dinámico)
const botonesSecundarios = document.querySelectorAll(".btn-secundario");

botonesSecundarios.forEach((boton) => {
  boton.addEventListener("mouseenter", () => {
    boton.style.backgroundColor = "#ffcc00"; // color amarillo Renault
    boton.style.color = "#000";
  });

  boton.addEventListener("mouseleave", () => {
    boton.style.backgroundColor = "#333"; // color original
    boton.style.color = "#fff";
  });
});

// 3. Validar formulario de reserva y redirigir
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("form");

  if (formulario) {
    formulario.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = formulario.querySelector("input[placeholder*='nombre']").value.trim();
      const telefono = formulario.querySelector("input[placeholder*='teléfono']").value.trim();
      const dni = formulario.querySelector("input[placeholder*='DNI']").value.trim();
      const servicio = formulario.querySelector("select")?.value || "";
      const fecha = formulario.querySelector("input[type='date']")?.value || "";
      const vehiculo = formulario.querySelector("input[placeholder*='vehículo']").value.trim();

      if (!nombre || !telefono || !dni || !fecha || !vehiculo || servicio.includes("Tipo Servicio")) {
        alert("Por favor, completá todos los campos correctamente.");
        return;
      }

      if (isNaN(dni)) {
        alert("El DNI debe ser numérico.");
        return;
      }

      // Redirección al finalizar correctamente
      window.location.href = "reserva.html";
    });
  }
});




// Redirigir al hacer clic en "Ver Más"
const botonVerMas = document.getElementById("btnVerMas");
if (botonVerMas) {
  botonVerMas.addEventListener("click", () => {
    window.location.href = "productos.html";
  });
}

// 4. Marcar link activo
const enlaces = document.querySelectorAll(".nav a");
const currentPage = window.location.pathname.split("/").pop();

enlaces.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.borderBottom = "2px solid var(--color-acento)";
  }
});
