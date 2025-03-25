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
    
});