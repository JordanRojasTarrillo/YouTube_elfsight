// Funcionalidad para la plantilla Video List

async function loadVideoList(channelIdOrVideoId) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando lista de videos...</div>';
        
        // Determinar si es un ID de canal o un ID de video
        let channelId = channelIdOrVideoId;
        
        // Si parece ser un ID de video (11 caracteres), obtenemos el canal asociado
        if (channelIdOrVideoId && channelIdOrVideoId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(channelIdOrVideoId)) {
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelIdOrVideoId}&key=${YOUTUBE_API_KEY}`);
            const videoData = await videoResponse.json();
            
            if (videoData.items && videoData.items.length > 0) {
                channelId = videoData.items[0].snippet.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal asociado a este video.');
            }
        }
        // Si es un nombre de usuario (con @), intentamos obtener el canal
        else if (channelIdOrVideoId && channelIdOrVideoId.startsWith('@')) {
            // La API no permite buscar directamente por @username, así que usamos search
            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdOrVideoId)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const searchData = await searchResponse.json();
            
            if (searchData.items && searchData.items.length > 0) {
                channelId = searchData.items[0].id.channelId;
            } else {
                throw new Error('No se pudo encontrar el canal con ese nombre de usuario.');
            }
        }
        // Si no se proporciona un ID, usar uno predeterminado
        else if (!channelId) {
            channelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Google Developers channel como ejemplo
        }
        
        const maxResults = 10; // Mostrar 10 videos en la lista
        
        // Obtener videos del canal
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No se encontraron videos para este canal');
        }
        
        // Obtener estadísticas de los videos (vistas, duración, etc.)
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const statsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
        const statsData = await statsResponse.json();
        
        // Combinar datos de videos con sus estadísticas
        const videosWithStats = data.items.map(video => {
            const stats = statsData.items.find(item => item.id === video.id.videoId);
            return {
                ...video,
                statistics: stats ? stats.statistics : null,
                contentDetails: stats ? stats.contentDetails : null
            };
        });
        
        
    } catch (error) {
        handleLoadError(error, 'template-preview', 'Error al cargar la lista de videos');
    }
}