// Funcionalidad para la plantilla YouTube Channel

async function loadYouTubeChannel(channelIdOrUsername) {
    try {
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = '<div class="loading">Cargando información del canal...</div>';
        
        console.log("Intentando cargar canal con:", channelIdOrUsername);
        
        // Verificar si la API está disponible
        try {
            const testResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${YOUTUBE_API_KEY}`);
            const testData = await testResponse.json();
            
            if (testData.error) {
                throw new Error(`Error de API: ${testData.error.message}`);
            }
        } catch (err) {
            throw new Error(`No se pudo conectar con la API de YouTube: ${err.message}`);
        }
        
        // Determinar el tipo de entrada y obtener el ID del canal
        let channelId;
        
        // Si es un nombre de usuario con @, buscar el canal
        if (channelIdOrUsername.startsWith('@')) {
            const searchTerm = channelIdOrUsername.substring(1); // Quitar el @
            console.log("Buscando canal con término:", searchTerm);
            
            try {
                const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
                const searchData = await searchResponse.json();
                
                if (searchData.error) {
                    throw new Error(`Error en búsqueda: ${searchData.error.message}`);
                }
                
                if (searchData.items && searchData.items.length > 0) {
                    channelId = searchData.items[0].id.channelId;
                    console.log("Canal encontrado por búsqueda:", channelId);
                } else {
                    throw new Error('No se encontraron canales con ese nombre.');
                }
            } catch (err) {
                throw new Error(`Error al buscar canal: ${err.message}`);
            }
        } 
        // Si parece ser un ID de canal (UC seguido de caracteres)
        else if (channelIdOrUsername.startsWith('UC')) {
            channelId = channelIdOrUsername;
            console.log("Usando ID de canal directo:", channelId);
        }
        // Si parece ser un ID de video (11 caracteres)
        else if (channelIdOrUsername.length === 11) {
            console.log("Parece ser un ID de video, obteniendo canal asociado");
            
            try {
                const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`);
                const videoData = await videoResponse.json();
                
                if (videoData.error) {
                    throw new Error(`Error al obtener video: ${videoData.error.message}`);
                }
                
                if (videoData.items && videoData.items.length > 0) {
                    channelId = videoData.items[0].snippet.channelId;
                    console.log("Canal encontrado a partir del video:", channelId);
                } else {
                    throw new Error('No se encontró el video especificado.');
                }
            } catch (err) {
                throw new Error(`Error al obtener canal desde video: ${err.message}`);
            }
        }
        // En cualquier otro caso, intentar como búsqueda general
        else {
            console.log("Intentando como búsqueda general:", channelIdOrUsername);
            
            try {
                const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdOrUsername)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`);
                const searchData = await searchResponse.json();
                
                if (searchData.error) {
                    throw new Error(`Error en búsqueda: ${searchData.error.message}`);
                }
                
                if (searchData.items && searchData.items.length > 0) {
                    channelId = searchData.items[0].id.channelId;
                    console.log("Canal encontrado por búsqueda general:", channelId);
                } else {
                    throw new Error('No se encontraron canales con ese término de búsqueda.');
                }
            } catch (err) {
                throw new Error(`Error en búsqueda general: ${err.message}`);
            }
        }
        
        if (!channelId) {
            throw new Error('No se pudo determinar el ID del canal.');
        }
        
        // Obtener información del canal
        console.log("Obteniendo información del canal ID:", channelId);
        let channel;
        
        try {
            const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`);
            const channelData = await channelResponse.json();
            
            if (channelData.error) {
                throw new Error(`Error al obtener canal: ${channelData.error.message}`);
            }
            
            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('No se encontró información del canal.');
            }
            
            channel = channelData.items[0];
            console.log("Información del canal obtenida:", channel.snippet.title);
        } catch (err) {
            throw new Error(`Error al obtener información del canal: ${err.message}`);
        }
        
        // Obtener videos del canal
        console.log("Obteniendo videos del canal");
        let videos;
        
        try {
            const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=12&order=date&type=video&key=${YOUTUBE_API_KEY}`);
            const videosData = await videosResponse.json();
            
            if (videosData.error) {
                throw new Error(`Error al obtener videos: ${videosData.error.message}`);
            }
            
            if (!videosData.items || videosData.items.length === 0) {
                throw new Error('No se encontraron videos para este canal.');
            }
            
            videos = videosData.items;
            console.log(`Se encontraron ${videos.length} videos`);
        } catch (err) {
            throw new Error(`Error al obtener videos del canal: ${err.message}`);
        }
        
        
        
    } catch (error) {
        console.error("Error en loadYouTubeChannel:", error);
        const templatePreview = document.getElementById('template-preview');
        templatePreview.innerHTML = `
            <div class="error-message">
                <h3>Error al cargar el canal</h3>
                <p>${error.message}</p>
                <p>Intenta con otra URL o ID de canal.</p>
                <div class="error-details">
                    <p>Detalles técnicos:</p>
                    <pre>${error.toString()}</pre>
                    <p>Si el problema persiste, verifica tu clave de API de YouTube.</p>
                </div>
            </div>
        `;
    }
}