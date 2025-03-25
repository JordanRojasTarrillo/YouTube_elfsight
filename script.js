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
    
    
});