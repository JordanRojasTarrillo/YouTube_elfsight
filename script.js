document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const templateOptions = document.querySelectorAll('.template-option');
    const selectBtn = document.getElementById('select-btn');
    const searchContainer = document.getElementById('search-container');
    const videoUrlInput = document.getElementById('video-url');
    const searchBtn = document.getElementById('search-btn');
    const templatePreview = document.getElementById('template-preview');
    const embedBtn = document.getElementById('embed-btn');
    
    // Variables de estado
    let selectedTemplate = null;
    let currentVideoId = null;
    let currentChannelId = null;
    let currentUsername = null;
    
    // Añadir event listeners a las opciones de plantilla
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Quitar la clase 'selected' de todas las opciones
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Añadir la clase 'selected' a la opción clickeada
            this.classList.add('selected');
            
            // Guardar la plantilla seleccionada
            selectedTemplate = this.getAttribute('data-template');
            
            console.log('Plantilla seleccionada:', selectedTemplate);
        });
    });
    // Event listener para el botón de selección
    selectBtn.addEventListener('click', function() {
        if (!selectedTemplate) {
            alert('Por favor, selecciona una plantilla primero.');
            return;
        }
        
        // Mostrar el contenedor de búsqueda
        searchContainer.style.display = 'block';
        
        // Actualizar el placeholder según la plantilla seleccionada
        switch(selectedTemplate) {
            case '1': // YouTube Channel
                videoUrlInput.placeholder = 'Ingresa URL del canal o @username...';
                break;
            case '2': // Video Grid
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
            case '3': // Single Video
                videoUrlInput.placeholder = 'Ingresa URL del video...';
                break;
            case '4': // YouTube Subscribe
                videoUrlInput.placeholder = 'Ingresa URL del canal...';
                break;
            case '5': // Video Gallery
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
            case '7': // Video List
                videoUrlInput.placeholder = 'Ingresa URL del canal o playlist...';
                break;
        }
    });
    // Event listener para el botón de búsqueda
    searchBtn.addEventListener('click', function() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            alert('Por favor, ingresa una URL válida.');
            return;
        }
        
        // Extraer información de la URL
        const { videoId, channelId, username } = extractYouTubeInfo(url);
        
        // Guardar la información extraída
        currentVideoId = videoId;
        currentChannelId = channelId;
        currentUsername = username;
        
        // Cargar la plantilla seleccionada con la información extraída
        loadSelectedTemplate(selectedTemplate, { videoId, channelId, username, url });
        
        // Mostrar el botón de generar código embed
        embedBtn.style.display = 'block';
    });
    
    // Event listener para la tecla Enter en el input de URL
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Función para extraer información de una URL de YouTube
    function extractYouTubeInfo(url) {
        let videoId = null;
        let channelId = null;
        let username = null;
        
        // Intentar extraer ID de video
        const videoRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const videoMatch = url.match(videoRegex);
        
        if (videoMatch && videoMatch[1]) {
            videoId = videoMatch[1];
        }
        
        // Intentar extraer ID de canal o nombre de usuario
        if (url.includes('youtube.com/channel/')) {
            const channelRegex = /youtube\.com\/channel\/([^\/\?]+)/i;
            const channelMatch = url.match(channelRegex);
            
            if (channelMatch && channelMatch[1]) {
                channelId = channelMatch[1];
            }
        } else if (url.includes('youtube.com/c/') || url.includes('youtube.com/user/')) {
            const usernameRegex = /youtube\.com\/(?:c|user)\/([^\/\?]+)/i;
            const usernameMatch = url.match(usernameRegex);
            
            if (usernameMatch && usernameMatch[1]) {
                username = usernameMatch[1];
            }
        } else if (url.includes('youtube.com/@')) {
            const atUsernameRegex = /youtube\.com\/@([^\/\?]+)/i;
            const atUsernameMatch = url.match(atUsernameRegex);
            
            if (atUsernameMatch && atUsernameMatch[1]) {
                username = '@' + atUsernameMatch[1];
            }
        }
        
        console.log('Extracted info:', { videoId, channelId, username });
        return { videoId, channelId, username };
    }
    // Función para cargar la plantilla seleccionada
    function loadSelectedTemplate(templateId, { videoId, channelId, username, url }) {
        console.log('Loading template:', templateId, 'with data:', { videoId, channelId, username, url });
        
        switch(templateId) {
            case '1': // YouTube Channel
                if (channelId) {
                    loadYouTubeChannel(channelId);
                } else if (username) {
                    loadYouTubeChannel(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadYouTubeChannel(videoId);
                } else {
                    alert('No se pudo determinar el canal. Por favor, ingresa una URL de canal válida.');
                }
                break;
                
            case '2': // Video Grid
                if (channelId) {
                    loadVideoGrid(channelId);
                } else if (username) {
                    loadVideoGrid(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoGrid(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            case '3': // Single Video
                if (videoId) {
                    loadSingleVideo(videoId);
                } else {
                    alert('No se pudo determinar el ID del video. Por favor, ingresa una URL de video válida.');
                }
                break;
                
            case '4': // YouTube Subscribe
                if (channelId) {
                    loadYouTubeSubscribe(channelId);
                } else if (username) {
                    loadYouTubeSubscribe(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadYouTubeSubscribe(videoId);
                } else {
                    alert('No se pudo determinar el canal. Por favor, ingresa una URL de canal válida.');
                }
                break;
                
            case '5': // Video Gallery
                if (channelId) {
                    loadVideoGallery(channelId);
                } else if (username) {
                    loadVideoGallery(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoGallery(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            case '7': // Video List
                if (channelId) {
                    loadVideoList(channelId);
                } else if (username) {
                    loadVideoList(username);
                } else if (videoId) {
                    // Si solo tenemos un ID de video, intentamos obtener el canal a partir de él
                    loadVideoList(videoId);
                } else {
                    alert('No se pudo determinar el canal o playlist. Por favor, ingresa una URL válida.');
                }
                break;
                
            default:
                alert('Plantilla no implementada.');
        }
    }
    
    // Event listener para el botón de generar código embed
    embedBtn.addEventListener('click', function() {
        generateEmbedCode(selectedTemplate, {
            videoId: currentVideoId,
            channelId: currentChannelId,
            username: currentUsername
        });
    });
    // Función para generar código embed
    function generateEmbedCode(templateId, { videoId, channelId, username }) {
        if (!templateId) {
            alert('Por favor, selecciona una plantilla primero.');
            return;
        }
        
        if (!videoId && !channelId && !username) {
            alert('No hay suficiente información para generar el código embed.');
            return;
        }
        
        // Determinar el identificador a usar
        let identifier = channelId || username || videoId;
        
        // URL base donde estará alojado tu script (cámbiala por tu dominio real cuando subas el proyecto)
        const scriptBaseUrl = window.location.origin;
        
        // Crear el código embed según la plantilla
        let embedCode = '';
        
        switch(templateId) {
            case '1': // YouTube Channel
                embedCode = `<!-- YouTube Channel Embed -->
<div class="youtube-template-embed" data-template="1" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            case '2': // Video Grid
                embedCode = `<!-- YouTube Video Grid Embed -->
<div class="youtube-template-embed" data-template="2" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            case '3': // Single Video
                embedCode = `<!-- YouTube Single Video Embed -->
<div class="youtube-template-embed" data-template="3" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            case '4': // YouTube Subscribe
                embedCode = `<!-- YouTube Subscribe Button Embed -->
<div class="youtube-template-embed" data-template="4" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            case '5': // Video Gallery
                embedCode = `<!-- YouTube Video Gallery Embed -->
<div class="youtube-template-embed" data-template="5" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            case '7': // Video List
                embedCode = `<!-- YouTube Video List Embed -->
<div class="youtube-template-embed" data-template="7" data-id="${identifier}"></div>
<script src="${scriptBaseUrl}/youtube-embed-handler.js"></script>`;
                break;
            default:
                alert('Generación de código embed no implementada para esta plantilla.');
                return;
        }
        
        // Mostrar el código en un modal
        const modal = document.createElement('div');
        modal.className = 'embed-modal';
        modal.innerHTML = `
            <div class="embed-modal-content">
                <span class="close-modal">&times;</span>
                <h3>Código para Embed</h3>
                <p>Copia y pega este código en cualquier sitio HTML donde quieras mostrar la plantilla:</p>
                <textarea readonly style="width: 100%; height: 120px; margin: 10px 0; padding: 8px; font-family: monospace;">${embedCode}</textarea>
                <button id="copy-embed" class="copy-btn">Copiar Código</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Añadir estilos para el modal si no existen
        if (!document.getElementById('embed-modal-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'embed-modal-styles';
            styleElement.textContent = `
                .embed-modal {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .embed-modal-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 600px;
                    position: relative;
                }
                
                .close-modal {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .copy-btn {
                    background-color: #4285f4;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .copy-btn:hover {
                    background-color: #3367d6;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Evento para cerrar el modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Evento para copiar el código
        modal.querySelector('#copy-embed').addEventListener('click', () => {
            const textarea = modal.querySelector('textarea');
            textarea.select();
            document.execCommand('copy');
            
            const copyBtn = modal.querySelector('#copy-embed');
            copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                copyBtn.textContent = 'Copiar Código';
            }, 2000);
        });
        
        // También cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
});