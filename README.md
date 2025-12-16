# Coast Controller Overlay

A custom OBS input overlay for a unique hybrid controller+mouse setup.

## Setup

- **Left Hand**: Xbox Elite 2 Controller (LT, LB, D-pad, LS, Menu buttons, Xbox button, Back paddles)
- **Right Hand**: Logitech M650 L Mouse (Left/Right click, Middle click, Scroll, Side buttons 4 & 5)

## Color Scheme

- **Green**: Body/background
- **Purple**: Idle state
- **Baby Blue**: Active/pressed state

## Usage in OBS

1. Add a **Browser Source** in OBS
2. Check **Local File** and browse to `index.html`
3. Set dimensions (recommended: 600x320)
4. Enable **Shutdown source when not visible** for performance
5. Enable **Refresh browser when scene becomes active**

## Configuration

Edit `script.js` to adjust:

- `CONFIG.pollRate` - Gamepad polling frequency
- `CONFIG.stickDeadzone` - Left stick deadzone threshold
- `CONFIG.debug` - Show/hide status panel

## Notes

- Back paddles (P1-P4) mapping may need adjustment based on your Elite 2 profile
- Mouse side buttons require browser focus to detect
- Press F12 in browser to access debug console
