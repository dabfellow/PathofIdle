# Path Of Idle

A browser-based idle RPG game with combat, inventory management, and character progression.

## Features

- Dynamic enemy system with SVG representations
- Character progression with multiple attributes
- Inventory system with drag-and-drop functionality
- Combat system with cooldowns
- Activity logging system with filters

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dabfellow/PathofIdle.git
cd PathofIdle
```

2. Open index.html in your browser or serve through a local web server.

## How to Play

1. **Combat**: Click the Attack button to fight enemies
2. **Level Up**: Gain experience and level up to earn attribute points
3. **Attributes**: Spend points on Strength, Dexterity, or Intelligence
4. **Inventory**: Drag and drop items to equip or move them

## Development

The game is built using vanilla JavaScript with a modular architecture:

- `game.js`: Main game logic and initialization
- `managers/`: Individual system managers (Enemy, Inventory, etc.)
- `utils.js`: Utility functions for calculations
- `constants.js`: Game configuration and constants

### Project Structure
```
PathofIdle/
├── js/
│   ├── managers/
│   │   ├── EnemyManager.js
│   │   ├── InventoryManager.js
│   │   ├── DragDropManager.js
│   │   └── InitializationManager.js
│   ├── game.js
│   ├── utils.js
│   └── constants.js
├── styles.css
└── index.html
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by various idle RPGs and Path of Exile
- SVG enemy designs created from scratch
