import { Game } from './core/game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game...');
    
    try {
        // Initialize game
        const game = new Game();
        
        // Add global reference
        window.game = game;
        
        // Initialize game and handle loading status
        game.initialize().then(success => {
            if (success) {
                console.log('Game initialized successfully');
            } else {
                console.error('Game failed to initialize');
            }
        }).catch(error => {
            console.error('Error during game initialization:', error);
        });
    } catch (error) {
        console.error('Failed to create game instance:', error);
    }
});
