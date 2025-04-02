# YouTube_elfsight
 https://jordanrojastarrillo.github.io/YouTube_elfsight/
 
 
 ## 📋 Descripción
 
 YouTube Templates Generator es una herramienta web que permite crear e incrustar diferentes tipos de plantillas de YouTube en cualquier sitio web. Con esta herramienta, puedes generar fácilmente visualizaciones personalizadas para canales, videos, galerías y más, sin necesidad de conocimientos avanzados de programación.
 
 ## ✨ Características
 
 - **Múltiples plantillas disponibles:**
   - 📺 Canal de YouTube completo
   - 🎬 Cuadrícula de videos
   - 📽️ Video individual
   - 🔔 Botón de suscripción
   - 🖼️ Galería de videos
   - 📋 Lista de videos
 
 - **Funcionalidades avanzadas:**
   - 🔍 Búsqueda y filtrado de videos
   - 🔄 Ordenamiento por fecha, popularidad o alfabético
   - 📱 Diseño responsivo para todos los dispositivos
   - 🎨 Estilos modernos y personalizables
   - 📊 Estadísticas de videos (vistas, likes, etc.)
 
 ## 🚀 Instalación
 
 1. Clona este repositorio:
    ```bash
    git clone https://github.com/JordanRojasTarrillo/YouTube_elfsight.git
    ```
 
 2. Navega al directorio del proyecto:
    ```bash
    cd YouTube_elfsight
    ```
 
 3. Abre el archivo `index.html` en tu navegador o configura un servidor web local.
 
 ## ⚙️ Configuración
 
 1. Obtén una clave de API de YouTube:
    - Ve a [Google Cloud Console](https://console.cloud.google.com/)
    - Crea un nuevo proyecto
    - Habilita la API de YouTube Data v3
    - Crea una clave de API
    - Restringe la clave para mayor seguridad
 
 2. Configura tu clave API:
    - Abre el archivo `config.js`
    - Reemplaza el valor de `'*********************************';` con tu clave
 
 ```javascript
 const YOUTUBE_API_KEY = '*********************************';
 ```
 
 ## 🔧 Uso
 
 ### Interfaz de usuario
 
 1. Selecciona una plantilla de la barra lateral
 2. Haz clic en "Seleccionar plantilla"
 3. Ingresa la URL de un canal o video de YouTube
 4. Haz clic en "Buscar" para generar la previsualización
 5. Utiliza el botón "Generar código" para obtener el código HTML para incrustar
 
 ### Incrustar en tu sitio web
 
 1. Copia el código generado
 2. Pega el código en cualquier página HTML donde quieras mostrar la plantilla
 3. ¡Listo! La plantilla se cargará automáticamente
 
 ```html
 <!-- Ejemplo de código generado -->
 <div class="youtube-template-embed" data-template="1" data-id="UC_x5XG1OV2P6uZZ5FSM9Ttw"></div>
 <script src="https://tu-dominio.com/youtube-embed-handler.js"></script>
 ```
 
 ## 📚 Documentación de plantillas
 
 ### Canal de YouTube
 
 Muestra la información completa de un canal, incluyendo banner, avatar, estadísticas y videos recientes.
 
 ### Cuadrícula de videos
 
 Presenta una cuadrícula de videos del canal con miniaturas, títulos y estadísticas básicas.
 
 ### Video individual
 
 Muestra un solo video con reproductor, título, descripción y estadísticas detalladas.
 
 ### Botón de suscripción
 
 Implementa un botón de suscripción personalizado para cualquier canal.
 
 ### Galería de videos
 
 Crea una galería interactiva con opciones de filtrado y visualización en cuadrícula o lista.
 
 ### Lista de videos
 
 Genera una lista detallada de videos con opciones de búsqueda y ordenamiento.
 
 ## 🔍 Ejemplos
 
 ### Canal de YouTube
 ```html
 <div class="youtube-template-embed" data-template="1" data-id="UC_x5XG1OV2P6uZZ5FSM9Ttw"></div>
 <script src="youtube-embed-handler.js"></script>
 ```
 
 ### Video individual
 ```html
 <div class="youtube-template-embed" data-template="3" data-id="dQw4w9WgXcQ"></div>
 <script src="youtube-embed-handler.js"></script>
 ```
 
 ## 🛠️ Tecnologías utilizadas
 
 - HTML5
 - CSS3 (Flexbox, Grid, Variables CSS)
 - JavaScript (ES6+)
 - YouTube Data API v3
 
 ## 📄 Licencia
 
 Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.
 
 ## 👨‍💻 Contribuir
 
 Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
 
 1. Haz un fork del repositorio
 2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
 3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
 4. Push a la rama (`git push origin feature/amazing-feature`)
 5. Abre un Pull Request
 
 ## 📞 Contacto
 
 Si tienes preguntas o sugerencias, no dudes en abrir un issue o contactarme directamente.
 
 ---
 
 ⭐️ ¡Si te gusta este proyecto, no olvides darle una estrella en GitHub! ⭐️
