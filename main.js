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
    toast: document.getElementById('toast')
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