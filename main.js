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