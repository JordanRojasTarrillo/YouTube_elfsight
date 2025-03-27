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
    // Función para cargar canal de YouTube


    // ===== PLANTILLA: 1 YOUTUBE CHANNEL =====
    // ===== PLANTILLA: YOUTUBE CHANNEL (MEJORADO) =====
async function loadYouTubeChannel(channelIdOrUsername, container) {
    container.innerHTML = '<div class="yt-loading"><div class="yt-spinner"></div><span>Cargando canal...</span></div>';
    
    try {
        let channelId = await getChannelId(channelIdOrUsername);
        
        const channelResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('No se pudo obtener información del canal.');
        }
        
        const channel = channelData.items[0];
        
        const videosResponse = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&maxResults=6&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        // Obtener detalles adicionales de los videos (duración, vistas)
        const videoIds = videosData.items.map(item => item.id.videoId).join(',');
        const videoDetailsResponse = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
        const videoDetailsData = await videoDetailsResponse.json();
        
        // Combinar datos de videos con sus detalles
        const videos = videosData.items.map(item => {
            const details = videoDetailsData.items.find(detail => detail.id === item.id.videoId);
            return {
                ...item,
                contentDetails: details ? details.contentDetails : null,
                statistics: details ? details.statistics : null
            };
        });
        
        const channelHTML = `
            <div class="yt-channel-container">
                ${channel.brandingSettings.image?.bannerExternalUrl ? 
                    `<div class="yt-channel-banner">
                        <img src="${channel.brandingSettings.image.bannerExternalUrl}" alt="Banner de ${channel.snippet.title}">
                    </div>` : ''}
                
                <div class="yt-channel-info">
                    <div class="yt-channel-header">
                        <div class="yt-channel-avatar-wrapper">
                            <img class="yt-channel-avatar" src="${channel.snippet.thumbnails.medium.url}" alt="${channel.snippet.title}">
                        </div>
                        <div class="yt-channel-details">
                            <h2 class="yt-channel-title">${channel.snippet.title}</h2>
                            <div class="yt-channel-stats">
                                <div class="yt-stat-item">
                                    <span class="yt-stat-value">${formatNumber(channel.statistics.subscriberCount)}</span>
                                    <span class="yt-stat-label">suscriptores</span>
                                </div>
                                <div class="yt-stat-divider"></div>
                                <div class="yt-stat-item">
                                    <span class="yt-stat-value">${formatNumber(channel.statistics.videoCount)}</span>
                                    <span class="yt-stat-label">videos</span>
                                </div>
                                <div class="yt-stat-divider"></div>
                                <div class="yt-stat-item">
                                    <span class="yt-stat-value">${formatNumber(channel.statistics.viewCount)}</span>
                                    <span class="yt-stat-label">vistas</span>
                                </div>
                            </div>
                            <div class="yt-channel-actions">
                                <a href="https://www.youtube.com/channel/${channelId}?sub_confirmation=1" target="_blank" class="yt-subscribe-btn">
                                    <svg viewBox="0 0 24 24" width="16" height="16" class="yt-subscribe-icon">
                                        <path fill="currentColor" d="M20,7H4V6h16V7z M22,9v12H2V9H22z M15,15l-5-3v6L15,15z M17,3H7v1h10V3z"/>
                                    </svg>
                                    Suscribirse
                                </a>
                                <a href="https://www.youtube.com/channel/${channelId}" target="_blank" class="yt-visit-btn">
                                    Visitar canal
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="yt-channel-description">
                        <p>${channel.snippet.description.split('\n')[0]}</p>
                    </div>
                </div>
                
                <div class="yt-channel-videos-section">
                    <div class="yt-section-header">
                        <h3>Videos recientes</h3>
                    </div>
                    
                    <div class="yt-video-grid">
                        ${videos.map(video => `
                            <div class="yt-video-card" data-video-id="${video.id.videoId}">
                                <div class="yt-thumbnail-container">
                                    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                                    <div class="yt-play-button">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="#fff" d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                    ${video.contentDetails?.duration ? 
                                        `<div class="yt-video-duration">${formatDuration(video.contentDetails.duration)}</div>` : ''}
                                </div>
                                <div class="yt-video-info">
                                    <h4 class="yt-video-title">${video.snippet.title}</h4>
                                    <div class="yt-video-meta">
                                        ${video.statistics?.viewCount ? 
                                            `<span class="yt-video-views">${formatNumber(video.statistics.viewCount)} vistas</span>` : ''}
                                        <span class="yt-video-date">${formatDate(video.snippet.publishedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="yt-channel-footer">
                        <a href="https://www.youtube.com/channel/${channelId}/videos" target="_blank" class="yt-view-all-btn">
                            Ver todos los videos
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        addChannelStyles();
        container.innerHTML = channelHTML;
        
        container.querySelectorAll('.yt-video-card').forEach(card => {
            card.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                showVideoModal(videoId);
            });
        });
        
    } catch (error) {
        console.error('Error al cargar el canal:', error);
        container.innerHTML = `<div class="yt-error">
            <svg viewBox="0 0 24 24" width="24" height="24" class="yt-error-icon">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>${error.message}</span>
        </div>`;
    }
}

function addChannelStyles() {
    if (document.getElementById('yt-channel-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'yt-channel-styles';
    styleElement.textContent = `
        /* Estilos generales */
        .yt-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            font-family: 'Roboto', Arial, sans-serif;
            color: #606060;
            font-size: 14px;
            text-align: center;
        }
        
        .yt-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top-color: #cc0000;
            animation: yt-spin 1s ease-in-out infinite;
            margin-bottom: 16px;
        }
        
        @keyframes yt-spin {
            to { transform: rotate(360deg); }
        }
        
        .yt-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #cc0000;
            text-align: center;
            padding: 40px 20px;
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 14px;
        }
        
        .yt-error-icon {
            color: #cc0000;
            margin-bottom: 12px;
            width: 48px;
            height: 48px;
        }
        
        /* Contenedor principal */
        .yt-channel-container {
            font-family: 'Roboto', Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #0f0f0f;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        
        /* Banner */
        .yt-channel-banner {
            width: 100%;
            height: 0;
            padding-bottom: 16.25%;
            position: relative;
            overflow: hidden;
            background-color: #f9f9f9;
        }
        
        .yt-channel-banner img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Información del canal */
        .yt-channel-info {
            padding: 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .yt-channel-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        
        .yt-channel-avatar-wrapper {
            margin-right: 24px;
            flex-shrink: 0;
        }
        
        .yt-channel-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background-color: #f5f5f5;
        }
        
        .yt-channel-details {
            flex: 1;
        }
        
        .yt-channel-title {
            margin: 0 0 12px 0;
            font-size: 24px;
            font-weight: 500;
            line-height: 1.2;
            color: #0f0f0f;
        }
        
        .yt-channel-stats {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        
        .yt-stat-item {
            display: flex;
            flex-direction: column;
            margin-right: 24px;
        }
        
        .yt-stat-value {
            font-size: 16px;
            font-weight: 500;
            color: #0f0f0f;
        }
        
        .yt-stat-label {
            font-size: 13px;
            color: #606060;
        }
        
        .yt-stat-divider {
            display: none;
        }
        
        .yt-channel-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .yt-subscribe-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #cc0000;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        
        .yt-subscribe-btn:hover {
            background-color: #aa0000;
            text-decoration: none;
        }
        
        .yt-subscribe-icon {
            margin-right: 8px;
        }
        
        .yt-visit-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;
            color: #606060;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        
        .yt-visit-btn:hover {
            background-color: #e5e5e5;
            text-decoration: none;
        }
        
        .yt-channel-description {
            font-size: 14px;
            line-height: 1.5;
            color: #606060;
        }
        
        .yt-channel-description p {
            margin: 0;
        }
        
        /* Sección de videos */
        .yt-channel-videos-section {
            padding: 24px;
        }
        
        .yt-section-header {
            margin-bottom: 20px;
        }
        
        .yt-section-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #0f0f0f;
        }
        
        .yt-video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .yt-video-card {
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            border-radius: 8px;
            overflow: hidden;
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .yt-video-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        
        .yt-thumbnail-container {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            background-color: #f5f5f5;
        }
        
        .yt-thumbnail-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .yt-play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            background: rgba(0,0,0,0.7);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.2s, background-color 0.2s;
        }
        
        .yt-thumbnail-container:hover .yt-play-button {
            opacity: 1;
            background-color: rgba(204, 0, 0, 0.8);
        }
        
        .yt-video-duration {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .yt-video-info {
            padding: 12px;
        }
        
        .yt-video-title {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.3;
            max-height: 2.6em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            color: #0f0f0f;
        }
        
        .yt-video-meta {
            display: flex;
            flex-direction: column;
            color: #606060;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .yt-video-views {
            margin-bottom: 2px;
        }
        
        .yt-channel-footer {
            display: flex;
            justify-content: center;
        }
        
        .yt-view-all-btn {
            display: inline-block;
            background-color: #f5f5f5;
            color: #606060;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        
        .yt-view-all-btn:hover {
            background-color: #e5e5e5;
            text-decoration: none;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .yt-channel-info,
            .yt-channel-videos-section {
                padding: 16px;
            }
            
            .yt-channel-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .yt-channel-avatar-wrapper {
                margin-right: 0;
                margin-bottom: 16px;
            }
            
            .yt-channel-stats {
                justify-content: center;
            }
            
            .yt-stat-item {
                margin: 0 12px;
            }
            
            .yt-channel-actions {
                justify-content: center;
            }
            
            .yt-video-grid {
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
            }
        }
        
        @media (max-width: 480px) {
            .yt-channel-avatar {
                width: 64px;
                height: 64px;
            }
            
            .yt-channel-title {
                font-size: 20px;
            }
            
            .yt-video-grid {
                grid-template-columns: 1fr;
            }
            
            .yt-subscribe-btn,
            .yt-visit-btn,
            .yt-view-all-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}
    // ===== PLANTILLA 2: VIDEO GRID =====
    async function loadVideoGrid(channelIdOrUsername, container) {
        container.innerHTML = '<div class="yt-loading">Cargando videos...</div>';
        
        try {
            // Determinar si es un ID de canal, nombre de usuario o ID de video
            let channelId = await getChannelId(channelIdOrUsername);
            
            // Obtener información del canal
            const channelResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`);
            const channelData = await channelResponse.json();
            
            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('No se pudo obtener información del canal.');
            }
            
            const channel = channelData.items[0];
            
            // Obtener videos del canal
            const videosResponse = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&maxResults=12&type=video&key=${YOUTUBE_API_KEY}`);
            const videosData = await videosResponse.json();
            
            if (!videosData.items || videosData.items.length === 0) {
                throw new Error('No se encontraron videos en este canal.');
            }
            
            // Generar HTML para la cuadrícula de videos
            const gridHTML = `
                <div class="yt-grid-container">
                    <div class="yt-grid-header">
                        <img class="yt-grid-channel-avatar" src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}">
                        <h2>${channel.snippet.title}</h2>
                    </div>
                    
                    <div class="yt-video-grid">
                        ${videosData.items.map(video => `
                            <div class="yt-video-card" data-video-id="${video.id.videoId}">
                                <div class="yt-thumbnail-container">
                                    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                                    <div class="yt-play-button"></div>
                                </div>
                                <div class="yt-video-info">
                                    <h4>${video.snippet.title}</h4>
                                    <p>${formatDate(video.snippet.publishedAt)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Añadir estilos si no existen
            addGridStyles();
            
            // Mostrar el HTML
            container.innerHTML = gridHTML;
            
            // Añadir event listeners para los videos
            container.querySelectorAll('.yt-video-card').forEach(card => {
                card.addEventListener('click', function() {
                    const videoId = this.getAttribute('data-video-id');
                    showVideoModal(videoId);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar la cuadrícula de videos:', error);
            container.innerHTML = `<p class="yt-error">Error: ${error.message}</p>`;
        }
    }
    
    // Función para mostrar un modal con el video
    function showVideoModal(videoId) {
        // Crear el modal si no existe
        let modal = document.getElementById('yt-video-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'yt-video-modal';
            modal.className = 'yt-video-modal';
            document.body.appendChild(modal);
        }
        
        // Mostrar el modal con el iframe
        modal.innerHTML = `
            <div class="yt-modal-content">
                <span class="yt-close-modal">&times;</span>
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
            </div>
        `;
        
        // Mostrar el modal
        modal.style.display = 'flex';
        
        // Evento para cerrar el modal
        modal.querySelector('.yt-close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            // Detener el video al cerrar
            modal.querySelector('iframe').src = '';
        });
        
        // También cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                // Detener el video al cerrar
                modal.querySelector('iframe').src = '';
            }
        });
    }
    
    // Función para formatear números grandes
    function formatNumber(num) {
        if (!num) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }
    
    document.head.appendChild(styleElement);
}
})();

