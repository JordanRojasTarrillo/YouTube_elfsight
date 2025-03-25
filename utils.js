// Funciones utilitarias para todas las plantillas

// Formatear números para mostrar K, M, etc.
function formatNumber(num) {
    if (!num) return '0';
    const number = parseInt(num);
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    } else {
        return number.toString();
    }
}

// Formatear duración del video (de ISO 8601 a formato legible)
function formatDuration(duration) {
    if (!duration) return '';
    
    // Convertir PT1H2M3S a formato legible (1:02:03)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = match[1] ? match[1] : '0';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    
    return hours !== '0' ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
        return 'Hoy';
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
        return `Hace ${Math.floor(diffDays / 7)} semanas`;
    } else if (diffDays < 365) {
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    } else {
        return `Hace ${Math.floor(diffDays / 365)} años`;
    }
}

// Mostrar modal con video y detalles
function showModal(videoId, title) {
    if (!videoId) {
        console.error('Video ID is required to show the modal.');
        return;
    }

    // Eliminar modal existente si hay uno
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Crear el modal básico con el iframe que ya funciona
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    // Estructura inicial del modal con el iframe que ya sabemos que funciona
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" role="button" aria-label="Close">&times;</span>
            <div class="video-container">
                <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="video-details">
                <h3 id="modal-title">${title || 'Cargando...'}</h3>
                <div id="video-info">
                    <div class="loading-spinner"></div>
                    <p>Cargando detalles del video...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Configurar eventos de cierre
    const closeModal = modal.querySelector('.close');
    closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Mostrar el modal
    modal.style.display = 'block';
    
    // Añadir estilos para el modal si no existen
    addModalStyles();
    
    // Cargar los detalles del video
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const statistics = video.statistics;
                const publishedAt = formatDate(snippet.publishedAt);
                
                // Actualizar el título si no se proporcionó uno
                if (!title) {
                    const modalTitle = document.getElementById('modal-title');
                    if (modalTitle) {
                        modalTitle.textContent = snippet.title;
                    }
                }
                
                // Actualizar la información del video
                const videoInfo = document.getElementById('video-info');
                if (videoInfo) {
                    videoInfo.innerHTML = `
                        <div class="video-header">
                            <div class="video-title-container">
                                <h3 class="video-title">${snippet.title}</h3>
                            </div>
                            <div class="video-meta">
                                <div class="video-stats">
                                    <span class="views">${formatNumber(statistics.viewCount)} visualizaciones</span>
                                    <span class="date">${publishedAt}</span>
                                </div>
                                <div class="video-actions">
                                    <button class="action-btn like-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                        </svg>
                                        <span>${formatNumber(statistics.likeCount)}</span>
                                    </button>
                                    <button class="action-btn dislike-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <button class="action-btn share-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" fill="currentColor"></path>
                                        </svg>
                                        <span>Compartir</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="channel-info">
                            <div class="channel-avatar">
                                <img src="https://yt3.googleusercontent.com/ytc/${snippet.channelId}" alt="${snippet.channelTitle}" onerror="this.src='https://via.placeholder.com/48'">
                            </div>
                            <div class="channel-details">
                                <h4 class="channel-name">${snippet.channelTitle}</h4>
                            </div>
                            <button class="subscribe-btn">SUSCRIBIRSE</button>
                        </div>
                        
                        <div class="video-description">
                            <div class="description-text">
                                <p>${snippet.description.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    `;
                }
                
                // Cargar comentarios
                fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${YOUTUBE_API_KEY}`)
                    .then(response => response.json())
                    .then(commentsData => {
                        if (commentsData.items && commentsData.items.length > 0) {
                            const videoInfo = document.getElementById('video-info');
                            let commentsHtml = `
                                <div class="comments-section">
                                    <div class="comments-header">
                                        <h4>${formatNumber(statistics.commentCount)} comentarios</h4>
                                        <div class="comments-sort">
                                            <svg viewBox="0 0 24 24" width="24" height="24">
                                                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="currentColor"></path>
                                            </svg>
                                            <span>ORDENAR POR</span>
                                        </div>
                                    </div>
                                    
                                    <div class="add-comment">
                                        <div class="user-avatar">
                                            <img src="https://via.placeholder.com/40" alt="Usuario">
                                        </div>
                                        <div class="comment-input">
                                            <input type="text" placeholder="Añadir un comentario público...">
                                        </div>
                                    </div>
                                    
                                    <div class="comments-list">
                            `;
                            
                            commentsData.items.forEach(item => {
                                const comment = item.snippet.topLevelComment.snippet;
                                const commentDate = formatDate(comment.publishedAt);
                                
                                commentsHtml += `
                                    <div class="comment">
                                        <div class="comment-avatar">
                                            <img src="${comment.authorProfileImageUrl}" alt="${comment.authorDisplayName}">
                                        </div>
                                        <div class="comment-content">
                                            <div class="comment-header">
                                                <span class="comment-author">${comment.authorDisplayName}</span>
                                                <span class="comment-date">${commentDate}</span>
                                            </div>
                                            <div class="comment-text">${comment.textDisplay}</div>
                                            <div class="comment-actions">
                                                <button class="comment-like">
                                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" fill="currentColor"></path>
                                                    </svg>
                                                    <span>${formatNumber(comment.likeCount)}</span>
                                                </button>
                                                <button class="comment-dislike">
                                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                                        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="currentColor"></path>
                                                    </svg>
                                                </button>
                                                <button class="comment-reply">RESPONDER</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                            
                            commentsHtml += `
                                    </div>
                                </div>
                            `;
                            
                            videoInfo.insertAdjacentHTML('beforeend', commentsHtml);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching comments:', error);
                        const videoInfo = document.getElementById('video-info');
                        if (videoInfo) {
                            videoInfo.insertAdjacentHTML('beforeend', `
                                <div class="comments-section">
                                    <div class="comments-header">
                                        <h4>Comentarios</h4>
                                    </div>
                                    <p class="error-message">No se pudieron cargar los comentarios: ${error.message}</p>
                                </div>
                            `);
                        }
                    });
            } else {
                const videoInfo = document.getElementById('video-info');
                if (videoInfo) {
                    videoInfo.innerHTML = '<p class="error-message">No se pudieron cargar los detalles del video.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching video details:', error);
            const videoInfo = document.getElementById('video-info');
            if (videoInfo) {
                videoInfo.innerHTML = `<p class="error-message">Error al cargar los detalles: ${error.message}</p>`;
            }
        });
}


