// Cloud SMP Website - Main JavaScript

// Configuration
const CONFIG = {
    API_KEY: 'dk05483CdnB6WBEfm7esQ3J7BvuIrLsC',
    DISCORD_API_BASE: 'https://dms-api.mcboss.top/api',
    MINECRAFT_API_BASE: 'https://api.mcsrvstat.us/3',
    SERVER_ADDRESS: 'mc-cloudsmp.mcboss.top',
    UPDATE_INTERVAL: 30000 // 30 seconds
};

// Global variables
let serverData = null;
let discordData = null;
let updateInterval = null;

// DOM Elements
const elements = {
    serverIcon: document.getElementById('server-icon'),
    playerCount: document.getElementById('player-count'),
    serverVersion: document.getElementById('server-version'),
    serverAddress: document.getElementById('server-address'),
    serverMotd: document.getElementById('server-motd'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    toast: document.getElementById('toast'),
    discordButton: document.getElementById('discord-join-button')
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌩️ Cloud SMP Website Initialized');
    
    // Initial data fetch
    fetchServerData();
    fetchDiscordData();
    
    // Set up periodic updates
    setupPeriodicUpdates();
    
    // Set up event listeners
    setupEventListeners();
    
    // Add loading animations
    addLoadingAnimations();
});

// Fetch Minecraft server data
async function fetchServerData() {
    try {
        console.log('📡 Fetching server data...');
        const response = await fetch(`${CONFIG.MINECRAFT_API_BASE}/${CONFIG.SERVER_ADDRESS}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        serverData = data;
        
        updateServerInfo(data);
        console.log('✅ Server data updated successfully');
        
    } catch (error) {
        console.error('❌ Error fetching server data:', error);
        showOfflineStatus();
    }
}

// Fetch Discord server data
async function fetchDiscordData() {
    try {
        console.log('📡 Fetching Discord data...');
        const response = await fetch(`${CONFIG.DISCORD_API_BASE}/${CONFIG.API_KEY}/server-info`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        discordData = data;
        
        updateDiscordInfo(data);
        console.log('✅ Discord data updated successfully');
        
    } catch (error) {
        console.error('❌ Error fetching Discord data:', error);
        // Use fallback data if Discord API fails
        useFallbackDiscordData();
        showToast('Failed to load Discord invite link. Using fallback.', 'warning');
    }
}

// Update server information in the UI
function updateServerInfo(data) {
    if (!data) return;
    
    // Update player count
    if (elements.playerCount) {
        const online = data.players?.online || 0;
        const max = data.players?.max || 50;
        elements.playerCount.textContent = `${online}/${max}`;
        
        // Add animation effect
        elements.playerCount.style.animation = 'none';
        setTimeout(() => {
            elements.playerCount.style.animation = 'glow 2s ease-in-out infinite alternate';
        }, 10);
    }
    
    // Update server version
    if (elements.serverVersion && data.version) {
        elements.serverVersion.textContent = data.version;
    }
    
    // Update MOTD
    if (elements.serverMotd && data.motd) {
        elements.serverMotd.innerHTML = '';
        const motdLines = data.motd.clean || data.motd.raw || [];
        motdLines.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            elements.serverMotd.appendChild(p);
        });
    }
    
    // Update server icon
    if (elements.serverIcon && data.icon) {
        elements.serverIcon.src = data.icon;
        elements.serverIcon.style.opacity = '0';
        elements.serverIcon.onload = () => {
            elements.serverIcon.style.transition = 'opacity 0.3s ease';
            elements.serverIcon.style.opacity = '1';
        };
    }
    
    // Update status
    updateServerStatus(data.online);
}

// Update Discord information in the UI
function updateDiscordInfo(data) {
    if (!data) return;
    
    console.log('🔄 Updating Discord info:', data);
    
    // Update Discord member count if elements exist
    const discordMemberCount = document.getElementById('discord-member-count');
    if (discordMemberCount && data.server_info?.server_member_count) {
        discordMemberCount.textContent = data.server_info.server_member_count;
    }
    
    // Update Discord online count
    const discordOnlineCount = document.getElementById('discord-online-count');
    if (discordOnlineCount && data.server_info?.server_online_member_count) {
        discordOnlineCount.textContent = data.server_info.server_online_member_count;
    }
    
    // Update Discord server name
    const discordServerName = document.getElementById('discord-server-name');
    if (discordServerName && data.server_info?.server_name) {
        discordServerName.textContent = data.server_info.server_name;
    }
    
    // Update Discord invite link
    if (elements.discordButton && data.server_info?.generated_invite?.url) {
        elements.discordButton.href = data.server_info.generated_invite.url;
        console.log(`🔗 Updated Discord invite link to: ${data.server_info.generated_invite.url}`);
    } else if (elements.discordButton) {
        // Fallback if no invite link is available
        elements.discordButton.href = 'https://discord.gg/fallback-invite';
        console.log('⚠️ Using fallback Discord invite link');
    }
}

// Update server status indicator
function updateServerStatus(isOnline) {
    if (!elements.statusDot || !elements.statusText) return;
    
    // Remove existing classes
    elements.statusDot.classList.remove('online', 'offline');
    
    if (isOnline) {
        elements.statusDot.classList.add('online');
        elements.statusText.textContent = 'Online';
        elements.statusText.style.color = 'var(--success-color)';
    } else {
        elements.statusDot.classList.add('offline');
        elements.statusText.textContent = 'Offline';
        elements.statusText.style.color = 'var(--error-color)';
    }
}

// Show offline status when server is unreachable
function showOfflineStatus() {
    updateServerStatus(false);
    
    // Set default values
    if (elements.playerCount) {
        elements.playerCount.textContent = '0/50';
    }
    
    if (elements.serverVersion) {
        elements.serverVersion.textContent = '1.21.5';
    }
    
    if (elements.serverMotd) {
        elements.serverMotd.innerHTML = '<p>☁ Welcome to Cloud SMP ☁</p><p>Server temporarily unavailable</p>';
    }
}

// Use fallback Discord data
function useFallbackDiscordData() {
    const fallbackData = {
        server_info: {
            server_member_count: '50+',
            server_online_member_count: '15+',
            server_name: 'Cloud SMP Discord',
            generated_invite: {
                url: 'https://discord.gg/fallback-invite'
            }
        }
    };
    
    updateDiscordInfo(fallbackData);
}

// Setup periodic updates
function setupPeriodicUpdates() {
    // Clear existing interval if it exists
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Set up new interval
    updateInterval = setInterval(() => {
        fetchServerData();
        fetchDiscordData();
    }, CONFIG.UPDATE_INTERVAL);
    
    console.log(`⏰ Periodic updates set to ${CONFIG.UPDATE_INTERVAL / 1000} seconds`);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.closest('.nav-item').classList.add('active');
        }
    });
    
    // Sidebar hover effects
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('mouseenter', () => {
            sidebar.classList.add('expanded');
        });
        
        sidebar.addEventListener('mouseleave', () => {
            sidebar.classList.remove('expanded');
        });
    }
    
    // Button click animations
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Handle visibility change (pause updates when tab is not active)
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle window resize
function handleResize() {
    // Update mobile navigation if needed
    const isMobile = window.innerWidth <= 768;
    const mainContent = document.querySelector('.main-content');
    
    if (isMobile && mainContent) {
        mainContent.style.marginLeft = '0';
    } else if (mainContent) {
        mainContent.style.marginLeft = 'var(--sidebar-collapsed)';
    }
}

// Handle visibility change
function handleVisibilityChange() {
    if (document.hidden) {
        // Pause updates when tab is not visible
        if (updateInterval) {
            clearInterval(updateInterval);
            console.log('�每一 Updates paused (tab not visible)');
        }
    } else {
        // Resume updates when tab becomes visible
        setupPeriodicUpdates();
        // Fetch fresh data immediately
        fetchServerData();
        fetchDiscordData();
        console.log('▶️ Updates resumed (tab visible)');
    }
}

// Add loading animations
function addLoadingAnimations() {
    // Add skeleton loading animation to elements
    const loadingElements = [
        elements.playerCount,
        elements.serverVersion,
        elements.statusText
    ];
    
    loadingElements.forEach(element => {
        if (element) {
            element.classList.add('loading');
            element.style.background = 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)';
            element.style.backgroundSize = '200% 100%';
            element.style.animation = 'loading 1.5s infinite';
        }
    });
    
    // Remove loading animation after initial data load
    setTimeout(() => {
        loadingElements.forEach(element => {
            if (element) {
                element.classList.remove('loading');
                element.style.background = '';
                element.style.animation = '';
            }
        });
    }, 2000);
}

// Copy server IP to clipboard
function copyServerIP() {
    const serverIP = CONFIG.SERVER_ADDRESS;
    
    // Try to use the modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(serverIP).then(() => {
            showToast('Server IP copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy with clipboard API:', err);
            fallbackCopyText(serverIP);
        });
    } else {
        fallbackCopyText(serverIP);
    }
}

// Fallback copy method for older browsers
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Server IP copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy IP. Please copy manually: ' + text, 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    if (!elements.toast) return;
    
    // Update toast content
    const toastIcon = elements.toast.querySelector('i');
    const toastMessage = elements.toast.querySelector('span');
    
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    
    // Update icon based on type
    if (toastIcon) {
        toastIcon.className = '';
        switch (type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                toastIcon.className = 'fas fa-info-circle';
        }
    }
    
    // Show toast
    elements.toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Utility function to format time
function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Handle errors gracefully
function handleError(error, context = '') {
    console.error(`❌ Error in ${context}:`, error);
    
    // Show user-friendly error message
    if (context.includes('server')) {
        showToast('Unable to connect to server. Please try again later.', 'error');
    } else if (context.includes('discord')) {
        showToast('Discord information temporarily unavailable.', 'warning');
    }
}

// Initialize page-specific functionality
function initializePageSpecific() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
            // Home page specific initialization
            console.log('🏠 Home page initialized');
            break;
        case 'gallery.html':
            // Gallery page specific initialization
            console.log('🖼️ Gallery page initialized');
            break;
        case 'playerlist.html':
            // Player list page specific initialization
            console.log('👥 Player list page initialized');
            break;
        case 'discord.html':
            // Discord page specific initialization
            console.log('💬 Discord page initialized');
            break;
        case 'feedback.html':
            // Feedback page specific initialization
            console.log('💭 Feedback page initialized');
            break;
        case 'shop.html':
            // Shop page specific initialization
            console.log('🛒 Shop page initialized');
            break;
        default:
            console.log('📄 Page initialized');
    }
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    .loading {
        color: transparent !important;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

// Initialize page-specific functionality after DOM is loaded
document.addEventListener('DOMContentLoaded', initializePageSpecific);

// Cleanup function for when page is unloaded
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        console.log('🧹 Cleanup completed');
    }
});

// Export functions for global use
window.copyServerIP = copyServerIP;
window.showToast = showToast;

// Debug information (remove in production)
console.log('🔧 Debug info:', {
    config: CONFIG,
    userAgent: navigator.userAgent,
    screenSize: `${screen.width}x${screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`
});






// Gallery Page JavaScript

// Gallery Configuration
const GALLERY_CONFIG = {
    API_BASE: 'https://api-cloud-smp.mcboss.top',
    ITEMS_PER_PAGE: 4,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
};

// Gallery State
let galleryState = {
    currentPage: 1,
    totalMedia: 0,
    loadedMedia: [],
    isLoading: false,
    currentModalIndex: 0,
    hasError: false
};

// Gallery DOM Elements
const galleryElements = {
    grid: document.getElementById('gallery-grid'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    loading: document.getElementById('gallery-loading'),
    totalCount: document.getElementById('total-media-count'),
    lastUpdated: document.getElementById('last-updated'),
    modal: document.getElementById('media-modal'),
    modalMedia: document.getElementById('modal-media')
};

// Initialize Gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('gallery.html')) {
        initializeGallery();
    }
});

// Initialize Gallery
async function initializeGallery() {
    console.log('🖼️ Initializing Gallery...');
    
    try {
        // Get total media count first
        await fetchMediaCount();
        
        // Load initial media
        await loadMoreMedia();
        
        // Update last updated time
        updateLastUpdatedTime();
        
        console.log('✅ Gallery initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize gallery:', error);
        showGalleryError('Failed to load gallery. Please try again.');
    }
}

// Fetch media count from API
async function fetchMediaCount() {
    try {
        const response = await fetch(`${GALLERY_CONFIG.API_BASE}/media/count`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        galleryState.totalMedia = data.count || 0;
        
        // Update UI
        if (galleryElements.totalCount) {
            galleryElements.totalCount.textContent = galleryState.totalMedia;
        }
        
        console.log(`📊 Total media count: ${galleryState.totalMedia}`);
        
    } catch (error) {
        console.error('❌ Error fetching media count:', error);
        throw error;
    }
}

// Load more media items
async function loadMoreMedia() {
    if (galleryState.isLoading) return;
    
    // Check if we've loaded all media
    if (galleryState.loadedMedia.length >= galleryState.totalMedia) {
        hideLoadMoreButton();
        return;
    }
    
    galleryState.isLoading = true;
    showLoading();
    
    try {
        const startPosition = galleryState.loadedMedia.length + 1;
        const endPosition = Math.min(startPosition + GALLERY_CONFIG.ITEMS_PER_PAGE - 1, galleryState.totalMedia);
        
        console.log(`📥 Loading media ${startPosition} to ${endPosition}`);
        
        const mediaPromises = [];
        for (let i = startPosition; i <= endPosition; i++) {
            mediaPromises.push(fetchMediaInfo(i));
        }
        
        const mediaInfos = await Promise.all(mediaPromises);
        
        // Filter out failed requests
        const validMedia = mediaInfos.filter(info => info !== null);
        
        // Add to loaded media
        galleryState.loadedMedia.push(...validMedia);
        
        // Render new media items
        renderMediaItems(validMedia);
        
        // Update load more button
        updateLoadMoreButton();
        
        console.log(`✅ Loaded ${validMedia.length} media items`);
        
    } catch (error) {
        console.error('❌ Error loading more media:', error);
        showToast('Failed to load more media. Please try again.', 'error');
    } finally {
        galleryState.isLoading = false;
        hideLoading();
    }
}

// Fetch media info for a specific position
async function fetchMediaInfo(position, retryCount = 0) {
    try {
        const response = await fetch(`${GALLERY_CONFIG.API_BASE}/media/${position}/info`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`⚠️ Media at position ${position} not found`);
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const mediaInfo = await response.json();
        return mediaInfo;
        
    } catch (error) {
        console.error(`❌ Error fetching media info for position ${position}:`, error);
        
        // Retry logic
        if (retryCount < GALLERY_CONFIG.MAX_RETRIES) {
            console.log(`🔄 Retrying... (${retryCount + 1}/${GALLERY_CONFIG.MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, GALLERY_CONFIG.RETRY_DELAY));
            return fetchMediaInfo(position, retryCount + 1);
        }
        
        return null;
    }
}

// Render media items to the gallery grid
function renderMediaItems(mediaItems) {
    if (!galleryElements.grid) return;
    
    mediaItems.forEach((mediaInfo, index) => {
        if (!mediaInfo) return;
        
        const mediaElement = createMediaElement(mediaInfo);
        galleryElements.grid.appendChild(mediaElement);
    });
}

// Create a media element
function createMediaElement(mediaInfo) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.onclick = () => openModal(mediaInfo.position - 1); // Convert to 0-based index
    
    const mediaContent = document.createElement('div');
    mediaContent.className = 'media-content-wrapper';
    
    // Determine media type and create appropriate element
    if (mediaInfo.type && mediaInfo.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.className = 'media-content video';
        video.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        video.preload = 'metadata';
        video.muted = true;
        mediaContent.appendChild(video);
        
        // Add video overlay
        const overlay = document.createElement('div');
        overlay.className = 'media-overlay';
        overlay.innerHTML = '<i class="fas fa-play media-type-icon"></i>';
        mediaContent.appendChild(overlay);
        
    } else {
        const img = document.createElement('img');
        img.className = 'media-content';
        img.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        img.alt = mediaInfo.filename || 'Gallery Image';
        img.loading = 'lazy';
        
        // Add error handling
        img.onerror = () => {
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder';
            placeholder.innerHTML = '<i class="fas fa-image"></i><br>Failed to load';
            mediaContent.appendChild(placeholder);
        };
        
        mediaContent.appendChild(img);
        
        // Add image overlay
        const overlay = document.createElement('div');
        overlay.className = 'media-overlay';
        overlay.innerHTML = '<i class="fas fa-expand media-type-icon"></i>';
        mediaContent.appendChild(overlay);
    }
    
    mediaItem.appendChild(mediaContent);
    return mediaItem;
}

// Open media modal
function openModal(index) {
    if (!galleryElements.modal || !galleryState.loadedMedia[index]) return;
    
    galleryState.currentModalIndex = index;
    const mediaInfo = galleryState.loadedMedia[index];
    
    // Clear previous content
    galleryElements.modalMedia.innerHTML = '';
    
    // Create media element for modal
    if (mediaInfo.type && mediaInfo.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '80vh';
        galleryElements.modalMedia.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        img.alt = mediaInfo.filename || 'Gallery Image';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80vh';
        galleryElements.modalMedia.appendChild(img);
    }
    
    // Show modal
    galleryElements.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Update modal controls
    updateModalControls();
}

// Close modal
function closeModal() {
    if (!galleryElements.modal) return;
    
    galleryElements.modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Pause any videos
    const videos = galleryElements.modalMedia.querySelectorAll('video');
    videos.forEach(video => video.pause());
}

// Navigate to previous media in modal
function previousMedia() {
    if (galleryState.currentModalIndex > 0) {
        openModal(galleryState.currentModalIndex - 1);
    }
}

// Navigate to next media in modal
function nextMedia() {
    if (galleryState.currentModalIndex < galleryState.loadedMedia.length - 1) {
        openModal(galleryState.currentModalIndex + 1);
    }
}

// Update modal controls
function updateModalControls() {
    const prevBtn = document.querySelector('.modal-controls .modal-btn:first-child');
    const nextBtn = document.querySelector('.modal-controls .modal-btn:last-child');
    
    if (prevBtn) {
        prevBtn.disabled = galleryState.currentModalIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = galleryState.currentModalIndex === galleryState.loadedMedia.length - 1;
    }
}

// Refresh gallery
async function refreshGallery() {
    if (galleryState.isLoading) return;
    
    console.log('🔄 Refreshing gallery...');
    
    // Show loading state
    if (galleryElements.refreshBtn) {
        galleryElements.refreshBtn.classList.add('loading');
    }
    
    try {
        // Clear current state
        galleryState.loadedMedia = [];
        galleryState.currentPage = 1;
        galleryState.hasError = false;
        
        // Clear grid
        if (galleryElements.grid) {
            galleryElements.grid.innerHTML = '';
        }
        
        // Refresh cache on server
        await fetch(`${GALLERY_CONFIG.API_BASE}/media/refresh`);
        
        // Reload media count and initial media
        await fetchMediaCount();
        await loadMoreMedia();
        
        // Update last updated time
        updateLastUpdatedTime();
        
        showToast('Gallery refreshed successfully!', 'success');
        console.log('✅ Gallery refreshed successfully');
        
    } catch (error) {
        console.error('❌ Error refreshing gallery:', error);
        showToast('Failed to refresh gallery. Please try again.', 'error');
    } finally {
        if (galleryElements.refreshBtn) {
            galleryElements.refreshBtn.classList.remove('loading');
        }
    }
}

// Show loading state
function showLoading() {
    if (galleryElements.loading) {
        galleryElements.loading.classList.add('show');
    }
}

// Hide loading state
function hideLoading() {
    if (galleryElements.loading) {
        galleryElements.loading.classList.remove('show');
    }
}

// Update load more button
function updateLoadMoreButton() {
    if (!galleryElements.loadMoreBtn) return;
    
    const hasMoreMedia = galleryState.loadedMedia.length < galleryState.totalMedia;
    
    if (hasMoreMedia) {
        galleryElements.loadMoreBtn.classList.remove('hidden');
        galleryElements.loadMoreBtn.textContent = `Load More (${galleryState.loadedMedia.length}/${galleryState.totalMedia})`;
    } else {
        hideLoadMoreButton();
    }
}

// Hide load more button
function hideLoadMoreButton() {
    if (galleryElements.loadMoreBtn) {
        galleryElements.loadMoreBtn.classList.add('hidden');
    }
}

// Show gallery error
function showGalleryError(message) {
    if (!galleryElements.grid) return;
    
    galleryState.hasError = true;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'gallery-error';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Gallery</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="refreshGallery()">
            <i class="fas fa-sync-alt"></i> Try Again
        </button>
    `;
    
    galleryElements.grid.appendChild(errorElement);
    hideLoadMoreButton();
}

// Update last updated time
function updateLastUpdatedTime() {
    if (galleryElements.lastUpdated) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        galleryElements.lastUpdated.textContent = timeString;
    }
}

// Complete Gallery Page JavaScript - Continuation and completion

// Continue from where the original code left off...

// Handle keyboard navigation in modal (completing the original function)
document.addEventListener('keydown', function(e) {
    if (!galleryElements.modal.classList.contains('show')) return;
    
    switch (e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            previousMedia();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextMedia();
            break;
        case ' ':
            e.preventDefault();
            // Toggle play/pause for videos
            const video = galleryElements.modalMedia.querySelector('video');
            if (video) {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
            break;
    }
});

// Handle modal click outside to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Handle touch gestures for mobile navigation
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    if (!galleryElements.modal.classList.contains('show')) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!galleryElements.modal.classList.contains('show')) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Horizontal swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            // Swipe right - previous media
            previousMedia();
        } else {
            // Swipe left - next media
            nextMedia();
        }
    }
    
    // Vertical swipe down to close
    if (deltaY > 100 && Math.abs(deltaX) < 50) {
        closeModal();
    }
});

// Enhanced media loading with better error handling
async function loadMediaWithRetry(position, retryCount = 0) {
    try {
        const response = await fetch(`${GALLERY_CONFIG.API_BASE}/media/${position}`, {
            method: 'HEAD', // Check if media exists without downloading
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        if (retryCount < GALLERY_CONFIG.MAX_RETRIES) {
            console.log(`🔄 Retrying media ${position}... (${retryCount + 1}/${GALLERY_CONFIG.MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, GALLERY_CONFIG.RETRY_DELAY));
            return loadMediaWithRetry(position, retryCount + 1);
        }
        
        console.error(`❌ Failed to load media ${position}:`, error);
        return false;
    }
}

// Advanced media filtering and sorting
function filterAndSortMedia(mediaArray, options = {}) {
    let filteredMedia = [...mediaArray];
    
    // Filter by type
    if (options.type) {
        filteredMedia = filteredMedia.filter(media => {
            if (options.type === 'images') {
                return media.type && media.type.startsWith('image/');
            } else if (options.type === 'videos') {
                return media.type && media.type.startsWith('video/');
            }
            return true;
        });
    }
    
    // Filter by date range
    if (options.dateFrom || options.dateTo) {
        filteredMedia = filteredMedia.filter(media => {
            const mediaDate = new Date(media.created_at || media.modified_at);
            if (options.dateFrom && mediaDate < options.dateFrom) return false;
            if (options.dateTo && mediaDate > options.dateTo) return false;
            return true;
        });
    }
    
    // Sort media
    if (options.sortBy) {
        filteredMedia.sort((a, b) => {
            switch (options.sortBy) {
                case 'date-desc':
                    return new Date(b.created_at || b.modified_at) - new Date(a.created_at || a.modified_at);
                case 'date-asc':
                    return new Date(a.created_at || a.modified_at) - new Date(b.created_at || b.modified_at);
                case 'name-asc':
                    return (a.filename || '').localeCompare(b.filename || '');
                case 'name-desc':
                    return (b.filename || '').localeCompare(a.filename || '');
                case 'size-desc':
                    return (b.size || 0) - (a.size || 0);
                case 'size-asc':
                    return (a.size || 0) - (b.size || 0);
                default:
                    return 0;
            }
        });
    }
    
    return filteredMedia;
}

// Media search functionality
function searchMedia(query) {
    if (!query || query.length < 2) {
        return galleryState.loadedMedia;
    }
    
    const searchTerm = query.toLowerCase();
    
    return galleryState.loadedMedia.filter(media => {
        const filename = (media.filename || '').toLowerCase();
        const description = (media.description || '').toLowerCase();
        const tags = (media.tags || []).join(' ').toLowerCase();
        
        return filename.includes(searchTerm) || 
               description.includes(searchTerm) || 
               tags.includes(searchTerm);
    });
}

// Enhanced media element creation with lazy loading
function createEnhancedMediaElement(mediaInfo) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.setAttribute('data-position', mediaInfo.position);
    
    // Add intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMediaContent(entry.target, mediaInfo);
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
    
    observer.observe(mediaItem);
    
    // Add click handler
    mediaItem.onclick = () => {
        const mediaIndex = galleryState.loadedMedia.findIndex(m => m.position === mediaInfo.position);
        if (mediaIndex !== -1) {
            openModal(mediaIndex);
        }
    };
    
    // Add placeholder initially
    const placeholder = document.createElement('div');
    placeholder.className = 'media-placeholder loading';
    placeholder.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading...</p>
    `;
    mediaItem.appendChild(placeholder);
    
    return mediaItem;
}

// Load media content into element
function loadMediaContent(element, mediaInfo) {
    const placeholder = element.querySelector('.media-placeholder');
    
    const mediaContent = document.createElement('div');
    mediaContent.className = 'media-content-wrapper';
    
    if (mediaInfo.type && mediaInfo.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.className = 'media-content video';
        video.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        video.preload = 'metadata';
        video.muted = true;
        video.loop = true;
        
        // Add video event handlers
        video.addEventListener('loadedmetadata', () => {
            if (placeholder) {
                placeholder.remove();
            }
            
            // Add video duration display
            const duration = formatDuration(video.duration);
            const durationBadge = document.createElement('div');
            durationBadge.className = 'media-duration';
            durationBadge.textContent = duration;
            mediaContent.appendChild(durationBadge);
        });
        
        video.addEventListener('error', () => {
            showMediaError(mediaContent, 'Failed to load video');
        });
        
        // Hover to play preview
        element.addEventListener('mouseenter', () => {
            video.play().catch(e => console.warn('Video play failed:', e));
        });
        
        element.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        mediaContent.appendChild(video);
        
        // Add video overlay
        const overlay = document.createElement('div');
        overlay.className = 'media-overlay';
        overlay.innerHTML = '<i class="fas fa-play media-type-icon"></i>';
        mediaContent.appendChild(overlay);
        
    } else {
        const img = document.createElement('img');
        img.className = 'media-content';
        img.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        img.alt = mediaInfo.filename || 'Gallery Image';
        img.loading = 'lazy';
        
        img.addEventListener('load', () => {
            if (placeholder) {
                placeholder.remove();
            }
            
            // Add image info if available
            if (mediaInfo.size) {
                const sizeBadge = document.createElement('div');
                sizeBadge.className = 'media-size';
                sizeBadge.textContent = formatFileSize(mediaInfo.size);
                mediaContent.appendChild(sizeBadge);
            }
        });
        
        img.addEventListener('error', () => {
            showMediaError(mediaContent, 'Failed to load image');
        });
        
        mediaContent.appendChild(img);
        
        // Add image overlay
        const overlay = document.createElement('div');
        overlay.className = 'media-overlay';
        overlay.innerHTML = '<i class="fas fa-expand media-type-icon"></i>';
        mediaContent.appendChild(overlay);
    }
    
    // Add media info
    if (mediaInfo.filename) {
        const infoBar = document.createElement('div');
        infoBar.className = 'media-info';
        infoBar.innerHTML = `
            <span class="media-filename">${truncateText(mediaInfo.filename, 20)}</span>
            <span class="media-date">${formatDate(mediaInfo.created_at || mediaInfo.modified_at)}</span>
        `;
        mediaContent.appendChild(infoBar);
    }
    
    element.appendChild(mediaContent);
}

// Show media error
function showMediaError(container, message) {
    const placeholder = container.querySelector('.media-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'media-error';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
    `;
    container.appendChild(errorElement);
}

// Enhanced modal with fullscreen support
function openEnhancedModal(index) {
    if (!galleryElements.modal || !galleryState.loadedMedia[index]) return;
    
    galleryState.currentModalIndex = index;
    const mediaInfo = galleryState.loadedMedia[index];
    
    // Clear previous content
    galleryElements.modalMedia.innerHTML = '';
    
    // Create enhanced media element for modal
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'modal-media-container';
    
    if (mediaInfo.type && mediaInfo.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '80vh';
        video.style.objectFit = 'contain';
        
        // Add video event listeners
        video.addEventListener('loadedmetadata', () => {
            updateModalInfo(mediaInfo, video);
        });
        
        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = `${GALLERY_CONFIG.API_BASE}/media/${mediaInfo.position}`;
        img.alt = mediaInfo.filename || 'Gallery Image';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80vh';
        img.style.objectFit = 'contain';
        
        // Add zoom functionality
        let isZoomed = false;
        let scale = 1;
        
        img.addEventListener('click', (e) => {
            if (!isZoomed) {
                scale = 2;
                img.style.transform = `scale(${scale})`;
                img.style.cursor = 'zoom-out';
                isZoomed = true;
            } else {
                scale = 1;
                img.style.transform = `scale(${scale})`;
                img.style.cursor = 'zoom-in';
                isZoomed = false;
            }
        });
        
        img.addEventListener('load', () => {
            updateModalInfo(mediaInfo, img);
        });
        
        img.style.cursor = 'zoom-in';
        mediaContainer.appendChild(img);
    }
    
    galleryElements.modalMedia.appendChild(mediaContainer);
    
    // Show modal
    galleryElements.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Update modal controls
    updateModalControls();
    
    // Track modal view
    trackMediaView(mediaInfo);
}

// Update modal info display
function updateModalInfo(mediaInfo, mediaElement) {
    const existingInfo = galleryElements.modalMedia.querySelector('.modal-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const infoPanel = document.createElement('div');
    infoPanel.className = 'modal-info';
    
    let dimensions = '';
    if (mediaElement.tagName === 'VIDEO') {
        dimensions = `${mediaElement.videoWidth}x${mediaElement.videoHeight}`;
    } else if (mediaElement.tagName === 'IMG') {
        dimensions = `${mediaElement.naturalWidth}x${mediaElement.naturalHeight}`;
    }
    
    infoPanel.innerHTML = `
        <div class="modal-info-content">
            <h3>${mediaInfo.filename || 'Untitled'}</h3>
            <div class="modal-info-details">
                <span><i class="fas fa-calendar"></i> ${formatDate(mediaInfo.created_at || mediaInfo.modified_at)}</span>
                <span><i class="fas fa-ruler-combined"></i> ${dimensions}</span>
                <span><i class="fas fa-hdd"></i> ${formatFileSize(mediaInfo.size)}</span>
                <span><i class="fas fa-file"></i> ${mediaInfo.type || 'Unknown'}</span>
            </div>
            <div class="modal-info-actions">
                <button class="btn-icon" onclick="downloadMedia(${mediaInfo.position})" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" onclick="shareMedia(${mediaInfo.position})" title="Share">
                    <i class="fas fa-share"></i>
                </button>
                <button class="btn-icon" onclick="toggleFullscreen()" title="Fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
    
    galleryElements.modalMedia.appendChild(infoPanel);
}

// Download media
async function downloadMedia(position) {
    try {
        const response = await fetch(`${GALLERY_CONFIG.API_BASE}/media/${position}`);
        const blob = await response.blob();
        
        const mediaInfo = galleryState.loadedMedia.find(m => m.position === position);
        const filename = mediaInfo?.filename || `media_${position}`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Download started!', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// Share media
async function shareMedia(position) {
    const mediaInfo = galleryState.loadedMedia.find(m => m.position === position);
    const shareData = {
        title: 'Cloud SMP Gallery',
        text: `Check out this ${mediaInfo?.type?.startsWith('video/') ? 'video' : 'image'} from Cloud SMP!`,
        url: `${window.location.origin}/gallery.html#media-${position}`
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('Shared successfully!', 'success');
        } catch (error) {
            if (error.name !== 'AbortError') {
                fallbackShare(shareData);
            }
        }
    } else {
        fallbackShare(shareData);
    }
}

// Fallback share method
function fallbackShare(shareData) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Unable to share. Please copy the URL manually.', 'error');
        });
    } else {
        showToast('Sharing not supported. Please copy the URL manually.', 'error');
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        galleryElements.modal.requestFullscreen().catch(err => {
            console.error('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Track media view for analytics
function trackMediaView(mediaInfo) {
    // This could be connected to analytics
    console.log('Media viewed:', mediaInfo.filename || mediaInfo.position);
}

// Utility functions
function formatDuration(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Gallery statistics tracking
function updateGalleryStats() {
    const stats = {
        totalMedia: galleryState.totalMedia,
        loadedMedia: galleryState.loadedMedia.length,
        imageCount: galleryState.loadedMedia.filter(m => m.type?.startsWith('image/')).length,
        videoCount: galleryState.loadedMedia.filter(m => m.type?.startsWith('video/')).length,
        totalSize: galleryState.loadedMedia.reduce((sum, m) => sum + (m.size || 0), 0)
    };
    
    // Update stats display if elements exist
    const statsElements = {
        images: document.getElementById('image-count'),
        videos: document.getElementById('video-count'),
        totalSize: document.getElementById('total-size')
    };
    
    if (statsElements.images) statsElements.images.textContent = stats.imageCount;
    if (statsElements.videos) statsElements.videos.textContent = stats.videoCount;
    if (statsElements.totalSize) statsElements.totalSize.textContent = formatFileSize(stats.totalSize);
    
    return stats;
}

// Export functions for global use
window.loadMoreMedia = loadMoreMedia;
window.refreshGallery = refreshGallery;
window.openModal = openEnhancedModal;
window.closeModal = closeModal;
window.previousMedia = previousMedia;
window.nextMedia = nextMedia;
window.downloadMedia = downloadMedia;
window.shareMedia = shareMedia;
window.toggleFullscreen = toggleFullscreen;

// Initialize gallery when this script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('gallery.html')) {
            initializeGallery();
        }
    });
} else {
    if (window.location.pathname.includes('gallery.html')) {
        initializeGallery();
    }
}