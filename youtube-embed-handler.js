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
    
    // Función para formatear fechas
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hoy';
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
        }
    }
    
    // Función para añadir estilos CSS para la plantilla de canal
    function addChannelStyles() {
        if (document.getElementById('yt-channel-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'yt-channel-styles';
        styleElement.textContent = `
            .yt-loading {
                text-align: center;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            
            .yt-error {
                color: #cc0000;
                text-align: center;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            
            .yt-channel-container {
                font-family: 'Roboto', Arial, sans-serif;
                max-width: 100%;
                margin: 0 auto;
                color: #0f0f0f;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            }
            
            .yt-channel-banner {
                width: 100%;
                height: 0;
                padding-bottom: 16.25%;
                position: relative;
                overflow: hidden;
            }
            
            .yt-channel-banner img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .yt-channel-info {
                padding: 16px;
            }
            
            .yt-channel-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .yt-channel-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin-right: 16px;
            }
            
            .yt-channel-details {
                flex: 1;
            }
            
            .yt-channel-details h2 {
                margin: 0 0 4px 0;
                font-size: 20px;
            }
            
            .yt-channel-stats {
                color: #606060;
                font-size: 14px;
                margin: 0 0 12px 0;
            }
            
            .yt-subscribe-btn {
                background-color: #cc0000;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 2px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
            }
            
            .yt-channel-description {
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 16px;
                color: #606060;
            }
            
            .yt-channel-videos {
                padding: 0 16px 16px;
            }
            
            .yt-channel-videos h3 {
                font-size: 16px;
                margin: 0 0 16px 0;
            }
            
            .yt-video-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 16px;
            }
            
            .yt-video-card {
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .yt-video-card:hover {
                transform: translateY(-2px);
            }
            
            .yt-thumbnail-container {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%;
                margin-bottom: 8px;
            }
            
            .yt-thumbnail-container img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
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
                transition: opacity 0.2s;
            }
            
            .yt-play-button:after {
                content: '';
                display: block;
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-left: 16px solid white;
                margin-left: 4px;
            }
            
            .yt-thumbnail-container:hover .yt-play-button {
                opacity: 1;
            }
            
            .yt-video-info h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.2;
                max-height: 2.4em;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .yt-video-info p {
                margin: 0;
                font-size: 12px;
                color: #606060;
            }
            
            .yt-video-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .yt-modal-content {
                position: relative;
                width: 90%;
                max-width: 800px;
                aspect-ratio: 16/9;
            }
            
            .yt-close-modal {
                position: absolute;
                top: -30px;
                right: 0;
                color: white;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            
            @media (max-width: 768px) {
                .yt-video-grid {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                }
                
                .yt-channel-avatar {
                    width: 60px;
                    height: 60px;
                }
                
                .yt-channel-details h2 {
                    font-size: 18px;
                }
            }
            
            @media (max-width: 480px) {
                .yt-channel-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .yt-channel-avatar {
                    margin-bottom: 12px;
                }
                
                .yt-video-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Función para añadir estilos CSS para la plantilla de cuadrícula de videos
    function addGridStyles() {
        if (document.getElementById('yt-grid-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'yt-grid-styles';
        styleElement.textContent = `
            .yt-grid-container {
                font-family: 'Roboto', Arial, sans-serif;
                max-width: 100%;
                margin: 0 auto;
                color: #0f0f0f;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                padding: 16px;
            }
            
            .yt-grid-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .yt-grid-channel-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin-right: 12px;
            }
            
            .yt-grid-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }
            
            .yt-video-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 16px;
            }
            
            .yt-video-card {
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .yt-video-card:hover {
                transform: translateY(-2px);
            }
            
            .yt-thumbnail-container {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%;
                margin-bottom: 8px;
            }
            
            .yt-thumbnail-container img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
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
                transition: opacity 0.2s;
            }
            
            .yt-play-button:after {
                content: '';
                display: block;
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-left: 16px solid white;
                margin-left: 4px;
            }
            
            .yt-thumbnail-container:hover .yt-play-button {
                opacity: 1;
            }
            
            .yt-video-info h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.2;
                max-height: 2.4em;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .yt-video-info p {
                margin: 0;
                font-size: 12px;
                color: #606060;
            }
            
            @media (max-width: 768px) {
                .yt-video-grid {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                }
            }
            
            @media (max-width: 480px) {
                .yt-video-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Funciones para las otras plantillas (implementaciones mínimas)
    function loadSingleVideo(identifier, container) {
        container.innerHTML = '<p>Plantilla de Single Video: Próximamente</p>';
    }
    
    function loadYouTubeSubscribe(identifier, container) {
        container.innerHTML = '<p>Plantilla de YouTube Subscribe: Próximamente</p>';
    }
    
    function loadVideoGallery(identifier, container) {
        container.innerHTML = '<p>Plantilla de Video Gallery: Próximamente</p>';
    }
    
    function loadVideoList(identifier, container) {
        container.innerHTML = '<p>Plantilla de Video List: Próximamente</p>';
    }
    // ===== PLANTILLA 4: YOUTUBE SUBSCRIBE =====
async function loadYouTubeSubscribe(channelIdOrUsername, container) {
    container.innerHTML = '<div class="yt-loading">Cargando canal...</div>';
    
    try {
        // Determinar si es un ID de canal, nombre de usuario o ID de video
        let channelId = await getChannelId(channelIdOrUsername);
        
        // Obtener información del canal
        const channelResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('No se pudo obtener información del canal.');
        }
        
        const channel = channelData.items[0];
        
        // Generar HTML para el botón de suscripción
        const subscribeHTML = `
            <div class="yt-subscribe-container">
                <div class="yt-subscribe-card">
                    <img class="yt-subscribe-avatar" src="${channel.snippet.thumbnails.medium.url}" alt="${channel.snippet.title}">
                    <div class="yt-subscribe-info">
                        <h3>${channel.snippet.title}</h3>
                        <p>${formatNumber(channel.statistics.subscriberCount)} suscriptores</p>
                        <button class="yt-subscribe-btn-large">SUSCRIBIRSE</button>
                    </div>
                </div>
                <div class="yt-subscribe-description">
                    ${channel.snippet.description.split('\n').slice(0, 2).join('<br>')}
                    ${channel.snippet.description.split('\n').length > 2 ? '...' : ''}
                </div>
                <div class="yt-subscribe-footer">
                    <a href="https://www.youtube.com/channel/${channelId}" target="_blank" class="yt-visit-channel">
                        Visitar canal
                    </a>
                </div>
            </div>
        `;
        
        // Añadir estilos si no existen
        addSubscribeStyles();
        
        // Mostrar el HTML
        container.innerHTML = subscribeHTML;
        
        // Añadir event listener para el botón de suscripción
        container.querySelector('.yt-subscribe-btn-large').addEventListener('click', function() {
            window.open(`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`, '_blank');
        });
        
    } catch (error) {
        console.error('Error al cargar el botón de suscripción:', error);
        container.innerHTML = `<p class="yt-error">Error: ${error.message}</p>`;
    }
}

// Función para añadir estilos CSS para la plantilla de suscripción
function addSubscribeStyles() {
    if (document.getElementById('yt-subscribe-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'yt-subscribe-styles';
    styleElement.textContent = `
        .yt-subscribe-container {
            font-family: 'Roboto', Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #0f0f0f;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 16px;
        }
        
        .yt-subscribe-card {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .yt-subscribe-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-right: 16px;
            object-fit: cover;
        }
        
        .yt-subscribe-info {
            flex: 1;
        }
        
        .yt-subscribe-info h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 500;
        }
        
        .yt-subscribe-info p {
            margin: 0 0 12px 0;
            color: #606060;
            font-size: 14px;
        }
        
        .yt-subscribe-btn-large {
            background-color: #cc0000;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 2px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .yt-subscribe-btn-large:hover {
            background-color: #990000;
        }
        
        .yt-subscribe-description {
            font-size: 14px;
            line-height: 1.4;
            color: #606060;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .yt-subscribe-footer {
            text-align: right;
        }
        
        .yt-visit-channel {
            display: inline-block;
            color: #065fd4;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .yt-visit-channel:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            .yt-subscribe-card {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .yt-subscribe-avatar {
                margin-right: 0;
                margin-bottom: 12px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}
    // ===== PLANTILLA 5: VIDEO GALLERY =====
async function loadVideoGallery(channelIdOrUsername, container) {
    container.innerHTML = '<div class="yt-loading">Cargando galería de videos...</div>';
    
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
        
        // Obtener videos populares del canal
        const videosResponse = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&order=viewCount&maxResults=12&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (!videosData.items || videosData.items.length === 0) {
            throw new Error('No se encontraron videos en este canal.');
        }
        
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
        
        // Generar HTML para la galería de videos
        const galleryHTML = `
            <div class="yt-gallery-container">
                <div class="yt-gallery-header">
                    <div class="yt-gallery-channel-info">
                        <img src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}">
                        <h2>${channel.snippet.title}</h2>
                    </div>
                    
                    <div class="yt-gallery-controls">
                        <div class="yt-gallery-view-toggle">
                            <button class="yt-gallery-grid-btn active">Cuadrícula</button>
                            <button class="yt-gallery-list-btn">Lista</button>
                        </div>
                        
                        <div class="yt-gallery-filter">
                            <select class="yt-gallery-sort">
                                <option value="popular">Más populares</option>
                                <option value="recent">Más recientes</option>
                                <option value="oldest">Más antiguos</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="yt-gallery-videos yt-gallery-grid-view">
                    ${videos.map(video => `
                        <div class="yt-gallery-video" data-video-id="${video.id.videoId}">
                            <div class="yt-thumbnail-container">
                                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                                <div class="yt-play-button"></div>
                                ${video.contentDetails?.duration ? 
                                    `<div class="yt-video-duration">${formatDuration(video.contentDetails.duration)}</div>` : ''}
                            </div>
                            <div class="yt-gallery-video-info">
                                <h4>${video.snippet.title}</h4>
                                <div class="yt-gallery-video-meta">
                                    ${video.statistics?.viewCount ? 
                                        `<span>${formatNumber(video.statistics.viewCount)} visualizaciones</span>` : ''}
                                    <span>${formatDate(video.snippet.publishedAt)}</span>
                                </div>
                                <p class="yt-gallery-video-desc">${video.snippet.description.split('\n')[0]}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="yt-gallery-pagination">
                    <button class="yt-gallery-page-btn" disabled>1</button>
                    <button class="yt-gallery-page-btn">2</button>
                    <button class="yt-gallery-page-btn">3</button>
                    <button class="yt-gallery-next-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Añadir estilos si no existen
        addGalleryStyles();
        
        // Mostrar el HTML
        container.innerHTML = galleryHTML;
        
        // Añadir event listeners para los videos
        container.querySelectorAll('.yt-gallery-video').forEach(card => {
            card.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                showVideoModal(videoId);
            });
        });
        
        // Añadir event listeners para los controles de vista
        const gridBtn = container.querySelector('.yt-gallery-grid-btn');
        const listBtn = container.querySelector('.yt-gallery-list-btn');
        const videosContainer = container.querySelector('.yt-gallery-videos');
        
        if (gridBtn && listBtn && videosContainer) {
            gridBtn.addEventListener('click', function() {
                videosContainer.className = 'yt-gallery-videos yt-gallery-grid-view';
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            });
            
            listBtn.addEventListener('click', function() {
                videosContainer.className = 'yt-gallery-videos yt-gallery-list-view';
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            });
        }
        
        // Añadir event listener para el selector de ordenamiento
        const sortSelect = container.querySelector('.yt-gallery-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                // En una implementación real, aquí se reordenarían los videos
                // Por ahora solo mostramos un mensaje
                alert('Ordenamiento cambiado a: ' + this.value);
            });
        }
        
    } catch (error) {
        console.error('Error al cargar la galería de videos:', error);
        container.innerHTML = `<p class="yt-error">Error: ${error.message}</p>`;
    }
}

// Función para añadir estilos CSS para la plantilla de galería de videos
function addGalleryStyles() {
    if (document.getElementById('yt-gallery-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'yt-gallery-styles';
    styleElement.textContent = `
        .yt-gallery-container {
            font-family: 'Roboto', Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #0f0f0f;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 16px;
        }
        
        .yt-gallery-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .yt-gallery-channel-info {
            display: flex;
            align-items: center;
        }
        
        .yt-gallery-channel-info img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
        }
        
        .yt-gallery-channel-info h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }
        
        .yt-gallery-controls {
            display: flex;
            gap: 16px;
        }
        
        .yt-gallery-view-toggle {
            display: flex;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .yt-gallery-view-toggle button {
            background: none;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .yt-gallery-view-toggle button.active {
            background-color: #f1f1f1;
            font-weight: 500;
        }
        
        .yt-gallery-filter select {
            padding: 6px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            background-color: white;
            font-size: 14px;
            cursor: pointer;
        }
        
        .yt-gallery-videos {
            margin-bottom: 20px;
        }
        
        .yt-gallery-grid-view {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
        }
        
        .yt-gallery-list-view {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .yt-gallery-list-view .yt-gallery-video {
            display: flex;
            gap: 16px;
        }
        
        .yt-gallery-list-view .yt-thumbnail-container {
            width: 240px;
            flex-shrink: 0;
        }
        
        .yt-gallery-video {
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .yt-gallery-video:hover {
            transform: translateY(-2px);
        }
        
        .yt-thumbnail-container {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            margin-bottom: 8px;
        }
        
        .yt-thumbnail-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
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
            transition: opacity 0.2s;
        }
        
        .yt-play-button:after {
            content: '';
            display: block;
            width: 0;
            height: 0;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-left: 16px solid white;
            margin-left: 4px;
        }
        
        .yt-thumbnail-container:hover .yt-play-button {
            opacity: 1;
        }
        
        .yt-video-duration {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .yt-gallery-video-info h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.2;
            max-height: 2.4em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .yt-gallery-video-meta {
            display: flex;
            gap: 8px;
            color: #606060;
            font-size: 12px;
            margin-bottom: 4px;
        }
        
        .yt-gallery-video-desc {
            margin: 0;
            font-size: 12px;
            color: #606060;
            line-height: 1.3;
            max-height: 2.6em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .yt-gallery-pagination {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 20px;
        }
        
        .yt-gallery-page-btn, .yt-gallery-next-btn {
            background: none;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .yt-gallery-page-btn[disabled] {
            background-color: #065fd4;
            color: white;
            border-color: #065fd4;
            cursor: default;
        }
        
        .yt-gallery-next-btn {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        @media (max-width: 768px) {
            .yt-gallery-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
            
            .yt-gallery-controls {
                width: 100%;
                justify-content: space-between;
            }
            
            .yt-gallery-grid-view {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            }
            
            .yt-gallery-list-view .yt-thumbnail-container {
                width: 120px;
            }
        }
        
        @media (max-width: 480px) {
            .yt-gallery-list-view .yt-gallery-video {
                flex-direction: column;
            }
            
            .yt-gallery-list-view .yt-thumbnail-container {
                width: 100%;
            }
            
            .yt-gallery-grid-view {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}
    // ===== PLANTILLA 3: SINGLE VIDEO =====
async function loadSingleVideo(videoId, container) {
    container.innerHTML = '<div class="yt-loading">Cargando video...</div>';
    
    try {
        // Verificar que sea un ID de video válido
        if (!videoId || videoId.length !== 11) {
            // Intentar extraer el ID si es una URL
            const match = videoId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (match && match[1]) {
                videoId = match[1];
            } else {
                throw new Error('ID de video no válido.');
            }
        }
        
        // Obtener información del video
        const videoResponse = await fetch(`${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        const videoData = await videoResponse.json();
        
        if (!videoData.items || videoData.items.length === 0) {
            throw new Error('No se pudo obtener información del video.');
        }
        
        const video = videoData.items[0];
        const snippet = video.snippet;
        const statistics = video.statistics;
        
        // Obtener información del canal
        const channelResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${snippet.channelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        const channelSnippet = channelData.items[0].snippet;
        
        // Generar HTML para el video
        const videoHTML = `
            <div class="yt-single-video-container">
                <div class="yt-video-player" data-video-id="${videoId}">
                    <div class="yt-thumbnail-container">
                        <img src="${snippet.thumbnails.high.url}" alt="${snippet.title}">
                        <div class="yt-play-button"></div>
                        ${video.contentDetails?.duration ? 
                            `<div class="yt-video-duration">${formatDuration(video.contentDetails.duration)}</div>` : ''}
                    </div>
                </div>
                
                <div class="yt-video-details">
                    <h2>${snippet.title}</h2>
                    
                    <div class="yt-video-meta">
                        <span class="yt-video-views">${formatNumber(statistics.viewCount)} visualizaciones</span>
                        <span class="yt-video-date">${formatDate(snippet.publishedAt)}</span>
                    </div>
                    
                    <div class="yt-video-stats">
                        <div class="yt-video-likes">
                            <span class="yt-like-icon">👍</span>
                            <span>${formatNumber(statistics.likeCount)}</span>
                        </div>
                    </div>
                    
                    <div class="yt-channel-info-small">
                        <img src="${channelSnippet.thumbnails.default.url}" alt="${channelSnippet.title}" class="yt-channel-avatar-small">
                        <span>${channelSnippet.title}</span>
                    </div>
                    
                    <div class="yt-video-description">
                        ${snippet.description.split('\n').slice(0, 3).join('<br>')}
                        ${snippet.description.split('\n').length > 3 ? '...' : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Añadir estilos si no existen
        addSingleVideoStyles();
        
        // Mostrar el HTML
        container.innerHTML = videoHTML;
        
        // Añadir event listener para reproducir el video
        container.querySelector('.yt-video-player').addEventListener('click', function() {
            showVideoModal(videoId);
        });
        
    } catch (error) {
        console.error('Error al cargar el video:', error);
        container.innerHTML = `<p class="yt-error">Error: ${error.message}</p>`;
    }
}

// Función para formatear la duración del video
function formatDuration(duration) {
    if (!duration) return '0:00';
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) return '0:00';
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Función para añadir estilos CSS para la plantilla de video individual
function addSingleVideoStyles() {
    if (document.getElementById('yt-single-video-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'yt-single-video-styles';
    styleElement.textContent = `
        .yt-single-video-container {
            font-family: 'Roboto', Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #0f0f0f;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 0 0 16px 0;
        }
        
        .yt-video-player {
            cursor: pointer;
            position: relative;
            width: 100%;
        }
        
        .yt-video-duration {
            position: absolute;
            bottom: 12px;
            right: 8px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .yt-video-details {
            padding: 16px;
        }
        
        .yt-video-details h2 {
            margin: 0 0 8px 0;
            font-size: 18px;
            line-height: 1.3;
        }
        
        .yt-video-meta {
            display: flex;
            gap: 12px;
            color: #606060;
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        .yt-video-stats {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
        }
        
        .yt-video-likes {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #606060;
            font-size: 14px;
        }
        
        .yt-like-icon {
            font-size: 16px;
        }
        
        .yt-channel-info-small {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        
        .yt-channel-avatar-small {
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }
        
        .yt-video-description {
            font-size: 14px;
            line-height: 1.4;
            color: #606060;
            white-space: pre-line;
        }
        
        @media (max-width: 480px) {
            .yt-video-meta {
                flex-direction: column;
                gap: 4px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
    
}
    // ===== PLANTILLA 7: VIDEO LIST =====
async function loadVideoList(channelIdOrUsername, container) {
    container.innerHTML = '<div class="yt-loading">Cargando lista de videos...</div>';
    
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
        const videosResponse = await fetch(`${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&maxResults=10&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (!videosData.items || videosData.items.length === 0) {
            throw new Error('No se encontraron videos en este canal.');
        }
        
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
        
        // Generar HTML para la lista de videos
        const listHTML = `
            <div class="yt-list-container">
                <div class="yt-list-header">
                    <div class="yt-list-channel-info">
                        <img src="${channel.snippet.thumbnails.default.url}" alt="${channel.snippet.title}" class="yt-list-channel-avatar">
                        <h2>${channel.snippet.title} - Videos recientes</h2>
                    </div>
                    
                    <div class="yt-list-filter">
                        <select class="yt-list-sort">
                            <option value="recent">Más recientes</option>
                            <option value="popular">Más populares</option>
                            <option value="oldest">Más antiguos</option>
                        </select>
                    </div>
                </div>
                
                <div class="yt-video-list">
                    ${videos.map((video, index) => `
                        <div class="yt-list-item" data-video-id="${video.id.videoId}">
                            <div class="yt-list-number">${index + 1}</div>
                            <div class="yt-list-thumbnail">
                                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                                <div class="yt-play-button-small"></div>
                                ${video.contentDetails?.duration ? 
                                    `<div class="yt-video-duration">${formatDuration(video.contentDetails.duration)}</div>` : ''}
                            </div>
                            <div class="yt-list-info">
                                <h4>${video.snippet.title}</h4>
                                <div class="yt-list-meta">
                                    ${video.statistics?.viewCount ? 
                                        `<span>${formatNumber(video.statistics.viewCount)} visualizaciones</span>` : ''}
                                    <span>${formatDate(video.snippet.publishedAt)}</span>
                                </div>
                                <p class="yt-list-desc">${video.snippet.description.split('\n')[0]}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="yt-list-footer">
                    <button class="yt-list-load-more">Cargar más videos</button>
                    <a href="https://www.youtube.com/channel/${channelId}" target="_blank" class="yt-visit-channel">
                        Ver todos los videos
                    </a>
                </div>
            </div>
        `;
        
        // Añadir estilos si no existen
        addListStyles();
        
        // Mostrar el HTML
        container.innerHTML = listHTML;
        
        // Añadir event listeners para los videos
        container.querySelectorAll('.yt-list-item').forEach(item => {
            item.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                showVideoModal(videoId);
            });
        });
        
        // Añadir event listener para el selector de ordenamiento
        const sortSelect = container.querySelector('.yt-list-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                // En una implementación real, aquí se reordenarían los videos
                // Por ahora solo mostramos un mensaje
                alert('Ordenamiento cambiado a: ' + this.value);
            });
        }
        
        // Añadir event listener para el botón de cargar más
        const loadMoreBtn = container.querySelector('.yt-list-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                // En una implementación real, aquí se cargarían más videos
                // Por ahora solo mostramos un mensaje
                alert('Esta función cargará más videos en una implementación completa.');
            });
        }
        
    } catch (error) {
        console.error('Error al cargar la lista de videos:', error);
        container.innerHTML = `<p class="yt-error">Error: ${error.message}</p>`;
    }
}

// Función para añadir estilos CSS para la plantilla de lista de videos
function addListStyles() {
    if (document.getElementById('yt-list-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'yt-list-styles';
    styleElement.textContent = `
        .yt-list-container {
            font-family: 'Roboto', Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #0f0f0f;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 16px;
        }
        
        .yt-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .yt-list-channel-info {
            display: flex;
            align-items: center;
        }
        
        .yt-list-channel-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
        }
        
        .yt-list-channel-info h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }
        
        .yt-list-filter select {
            padding: 6px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            background-color: white;
            font-size: 14px;
            cursor: pointer;
        }
        
        .yt-video-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .yt-list-item {
            display: flex;
            align-items: flex-start;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .yt-list-item:hover {
            background-color: #f9f9f9;
        }
        
        .yt-list-number {
            font-size: 18px;
            font-weight: 500;
            color: #606060;
            margin-right: 16px;
            min-width: 24px;
            text-align: center;
            padding-top: 8px;
        }
        
        .yt-list-thumbnail {
            position: relative;
            width: 160px;
            height: 90px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .yt-list-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .yt-play-button-small {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            background: rgba(0,0,0,0.7);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .yt-play-button-small:after {
            content: '';
            display: block;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 12px solid white;
            margin-left: 3px;
        }
        
        .yt-list-thumbnail:hover .yt-play-button-small {
            opacity: 1;
        }
        
        .yt-video-duration {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .yt-list-info {
            flex: 1;
            min-width: 0;
        }
        
        .yt-list-info h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .yt-list-meta {
            display: flex;
            gap: 8px;
            color: #606060;
            font-size: 12px;
            margin-bottom: 4px;
        }
        
        .yt-list-desc {
            margin: 0;
            font-size: 12px;
            color: #606060;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
        }
        
        .yt-list-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e0e0e0;
        }
        
        .yt-list-load-more {
            background-color: #f1f1f1;
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .yt-list-load-more:hover {
            background-color: #e0e0e0;
        }
        
        .yt-visit-channel {
            color: #065fd4;
            text-decoration: none;
            font-size: 14px;
        }
        
        .yt-visit-channel:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .yt-list-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            
            .yt-list-filter {
                width: 100%;
            }
            
            .yt-list-filter select {
                width: 100%;
            }
        }
        
        @media (max-width: 600px) {
            .yt-list-item {
                flex-wrap: wrap;
            }
            
            .yt-list-number {
                display: none;
            }
            
            .yt-list-thumbnail {
                width: 120px;
                height: 68px;
            }
            
            .yt-list-info {
                width: calc(100% - 136px);
            }
        }
        
        @media (max-width: 480px) {
            .yt-list-item {
                flex-direction: column;
            }
            
            .yt-list-thumbnail {
                width: 100%;
                height: 0;
                padding-bottom: 56.25%;
                margin-right: 0;
                margin-bottom: 8px;
            }
            
            .yt-list-info {
                width: 100%;
            }
            
            .yt-list-footer {
                flex-direction: column;
                gap: 12px;
            }
            
            .yt-list-load-more {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}
})();

