// YouTube Embed Handler - Para plantillas de YouTube
(function() {
    // Configuración
    const YOUTUBE_API_KEY = 'AIzaSyDBOZtYRCB5_dI_q9ihERRYZkaLRyR-xHQ';
    const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Buscar todos los elementos con la clase youtube-template-embed
        const embedElements = document.querySelectorAll('.youtube-template-embed');
        
        // Procesar cada elemento embed
        embedElements.forEach(function(element) {
            const templateType = element.getAttribute('data-template');
            const identifier = element.getAttribute('data-id');
            
            if (!templateType || !identifier) {
                element.innerHTML = '<p>Error: Faltan atributos requeridos (data-template, data-id)</p>';
                return;
            }
            
            // Cargar la plantilla según el tipo
            switch(templateType) {
                case '1': // YouTube Channel
                    loadYouTubeChannel(identifier, element);
                    break;
                case '2': // Video Grid
                    loadVideoGrid(identifier, element);
                    break;
                case '3': // Single Video
                    loadSingleVideo(identifier, element);
                    break;
                case '4': // YouTube Subscribe
                    loadYouTubeSubscribe(identifier, element);
                    break;
                case '5': // Video Gallery
                    loadVideoGallery(identifier, element);
                    break;
                case '7': // Video List
                    loadVideoList(identifier, element);
                    break;
                default:
                    element.innerHTML = '<p>Esta plantilla no está soportada.</p>';
            }
        });
    });
    // Función para obtener el ID de canal a partir de diferentes identificadores
    async function getChannelId(identifier) {
        if (identifier.startsWith('UC')) {
            // Es un ID de canal
            return identifier;
        } else if (identifier.startsWith('@')) {
            // Es un nombre de usuario con @
            const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${identifier}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return data.items[0].id.channelId;
            } else {
                throw new Error('No se encontró el canal con ese nombre de usuario.');
            }
        } else if (identifier.length === 11) {
            // Podría ser un ID de video, obtener el canal asociado
            const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=snippet&id=${identifier}&key=${YOUTUBE_API_KEY}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return data.items[0].snippet.channelId;
            } else {
                throw new Error('No se encontró el video especificado.');
            }
        } else {
            // Intentar buscar como nombre de canal
            const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${identifier}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return data.items[0].id.channelId;
            } else {
                throw new Error('No se pudo determinar el canal.');
            }
        }
    }
    
    
    document.head.appendChild(styleElement);
}
})();

