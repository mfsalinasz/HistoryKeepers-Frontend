# History Keepers - Frontend
Este es el repositorio de la interfaz gráfica para el proyecto "History Keepers", un museo virtual de artículos deportivos. 
El desarrollo se realizó utilizando tecnologías web estándar (HTML, CSS y JS) sin depender de frameworks complejos, para mantener el sitio ligero y compatible.

## Instalación y Despliegue Local

Prerrequisitos:
* Un navegador web
* VS Code
* Instalar Live Preview

Pasos para correrlo:

1.- Clonar el repositorio:
    git clone https://github.com/mfsalinasz/HistoryKeepers-Frontend.git

2.- Abrir en el editor: 
* Entrar a la carpeta del proyecto desde VS Code.

3.- Ejecutar el servidor de desarrollo:
* Abrir el archivo index.html
* Abrir con Live Preview o utilizando Live Server
* Se abrira en el navegador

## Documentación de Código

Estructura de Carpetas:

* /admin: Contiene el HTML, CSS y JS específicos del panel de control.

* /producto: Contiene los archivos para la vista de detalle de cada pieza.

* /superadmin: Panel especial para la gestión de usuarios (Staff).

* Raíz: Archivos públicos y Landing Page (index.html).

### Carpeta /admin

Contiene todo lo relacionado con el panel de control para administrar las piezas del museo.

**admin.html**: Estructura base del panel. Contiene la tabla vacía donde se listarán los productos y el código HTML del dialog que usamos para los formularios de crear y editar.

**admin.css**: Estilos exclusivos de esta vista. Define la apariencia de la tabla de datos, los botones de acción (Editar/Borrar) y las reglas para que el modal se superponga correctamente con el efecto de fondo borroso (backdrop-filter).

**admin.js**: El "cerebro" del CRUD.

* Mantiene el estado local del inventario.
* Gestiona la subida de imágenes a Cloudinary (convierte el archivo local a una URL pública).
* Envía las peticiones POST (Crear), PUT (Editar) y DELETE (Borrar) al Backend.

### Carpeta /producto

Módulo encargado de mostrar la información específica de una sola pieza.

**producto.html**: Es una plantilla "esqueleto". Al abrirse está vacía y depende de JavaScript para rellenar el título, la imagen y la descripción. Incluye la sección de "Comunidad HK".

**producto.css**: Controla el layout específico de esta página, utilizando un Grid asimétrico para la galería de fotos a la izquierda y la información a la derecha.

**producto.js**:

* Lectura de URL: Extrae el parámetro id de la barra de direcciones.
* Renderizado: Pide los datos al Backend y manipula el DOM para mostrarlos.
* Funcionalidad "Dato Curioso": Contiene la lógica para leer los aportes de la comunidad y la función asíncrona para enviar nuevos datos sin recargar la página.

### Carpeta /superadmin

Área restringida para la administración de usuarios del sistema (quién puede entrar al panel).

**superadmin.html**: Vista de tabla similar a la de admin, pero enfocada en la entidad User.

**styles.css**: Sobrescribe ciertos estilos globales para diferenciar visualmente el panel de superusuario del panel normal.

**script.js**: Lógica específica para conectar con el UsuarioController del backend. Permite registrar nuevos administradores y eliminar cuentas obsoletas.

### Raíz

Archivos base que orquestan el funcionamiento general del sitio.

**index.html**: La Landing Page. 
Contiene el banner de bienvenida y el contenedor donde se inyectan las tarjetas del catálogo principal.

**styles.css**: La hoja de estilos.

* Define las variables CSS para colores y fuentes.

* Configura el Header y Footer compartidos.

* Establece el sistema de Grid responsivo para las tarjetas de productos.

**script.js**: Controlador global.

* Gestiona la lógica del menú de navegación y la barra de búsqueda.

* Autenticación: Controla el modal de Login, valida las credenciales contra el Backend y guarda la sesión en el navegador.

**package-lock.json**: Archivo de metadatos generado automáticamente. Aunque el proyecto no requiere compilación, este archivo rastrea las versiones de dependencias del entorno de desarrollo (como extensiones de formateo de código).