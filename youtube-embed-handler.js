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
    
    
    
    document.head.appendChild(styleElement);
}
})();

