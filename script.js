/**
 * Coast Controller Overlay
 * Input detection for Xbox Elite 2 Controller (left hand) + Logitech M650 L Mouse (right hand)
 */

// ============================================
// Configuration
// ============================================

const CONFIG = {
    // Gamepad polling rate (ms)
    pollRate: 16, // ~60fps

    // Stick deadzone (0-1)
    stickDeadzone: 0.15,

    // Stick visual movement range (pixels)
    stickRange: 8,

    // Trigger threshold for button activation
    triggerThreshold: 0.1,

    // Sensor activity timeout (ms)
    sensorTimeout: 100,

    // Debug mode - shows status panel
    debug: true
};

// Standard Gamepad Button Mapping (Xbox layout)
const GAMEPAD_BUTTONS = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    VIEW: 8,      // Back/Select
    MENU: 9,      // Start
    LS: 10,       // Left Stick Click
    RS: 11,       // Right Stick Click
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15,
    XBOX: 16,
    // Elite 2 Back Paddles (may vary based on controller mapping)
    P1: 17,
    P2: 18,
    P3: 19,
    P4: 20
};

// Gamepad Axes
const GAMEPAD_AXES = {
    LS_X: 0,
    LS_Y: 1,
    RS_X: 2,
    RS_Y: 3
};

// ============================================
// State Management
// ============================================

const state = {
    gamepad: null,
    gamepadIndex: null,
    animationFrame: null,
    sensorTimer: null,
    lastMouseMove: 0
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Controller buttons
    lt: null,
    lb: null,
    ls: null,
    dpadUp: null,
    dpadDown: null,
    dpadLeft: null,
    dpadRight: null,
    viewBtn: null,
    menuBtn: null,
    xboxBtn: null,
    // Back paddles (2 left-side paddles only)
    // P1 = B (Crouch), P2 = RB (Tactical)
    p1: null,
    p2: null,

    // Mouse buttons
    mouseLeft: null,
    mouseRight: null,
    mouseMiddle: null,
    scrollUp: null,
    scrollDown: null,
    mouse4: null,
    mouse5: null,
    sensor: null,

    // Status
    gamepadStatus: null,
    mouseStatus: null,
    statusPanel: null
};

// ============================================
// Initialization
// ============================================

function init() {
    console.log('Coast Controller Overlay - Initializing...');

    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupGamepadListeners();
    setupMouseListeners();

    // Start gamepad polling
    startPolling();

    // Handle debug mode
    if (!CONFIG.debug && elements.statusPanel) {
        elements.statusPanel.classList.add('hidden');
    }

    console.log('Coast Controller Overlay - Ready!');
}

function cacheElements() {
    // Controller elements
    elements.lt = document.getElementById('lt');
    elements.lb = document.getElementById('lb');
    elements.ls = document.getElementById('ls');
    elements.dpadUp = document.getElementById('dpad-up');
    elements.dpadDown = document.getElementById('dpad-down');
    elements.dpadLeft = document.getElementById('dpad-left');
    elements.dpadRight = document.getElementById('dpad-right');
    elements.viewBtn = document.getElementById('view-btn');
    elements.menuBtn = document.getElementById('menu-btn');
    elements.xboxBtn = document.getElementById('xbox-btn');
    elements.p1 = document.getElementById('p1');
    elements.p2 = document.getElementById('p2');

    // Mouse elements
    elements.mouseLeft = document.getElementById('mouse-left');
    elements.mouseRight = document.getElementById('mouse-right');
    elements.mouseMiddle = document.getElementById('mouse-middle');
    elements.scrollUp = document.getElementById('scroll-up');
    elements.scrollDown = document.getElementById('scroll-down');
    elements.mouse4 = document.getElementById('mouse-4');
    elements.mouse5 = document.getElementById('mouse-5');
    elements.sensor = document.getElementById('sensor');

    // Status elements
    elements.gamepadStatus = document.getElementById('gamepad-status');
    elements.mouseStatus = document.getElementById('mouse-status');
    elements.statusPanel = document.getElementById('status-panel');
}

// ============================================
// Gamepad Handling
// ============================================

function setupGamepadListeners() {
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        state.gamepadIndex = e.gamepad.index;
        updateGamepadStatus(true, e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('Gamepad disconnected:', e.gamepad.id);
        if (state.gamepadIndex === e.gamepad.index) {
            state.gamepadIndex = null;
            updateGamepadStatus(false);
        }
    });
}

function updateGamepadStatus(connected, name = '') {
    if (elements.gamepadStatus) {
        if (connected) {
            elements.gamepadStatus.textContent = `Gamepad: ${name.substring(0, 30)}...`;
            elements.gamepadStatus.classList.add('connected');
            elements.gamepadStatus.classList.remove('disconnected');
        } else {
            elements.gamepadStatus.textContent = 'Gamepad: Not Connected';
            elements.gamepadStatus.classList.add('disconnected');
            elements.gamepadStatus.classList.remove('connected');
        }
    }
}

function startPolling() {
    function poll() {
        pollGamepad();
        state.animationFrame = requestAnimationFrame(poll);
    }
    poll();
}

function pollGamepad() {
    const gamepads = navigator.getGamepads();

    if (state.gamepadIndex === null) {
        // Try to find a gamepad
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                state.gamepadIndex = i;
                updateGamepadStatus(true, gamepads[i].id);
                break;
            }
        }
        return;
    }

    const gamepad = gamepads[state.gamepadIndex];
    if (!gamepad) {
        state.gamepadIndex = null;
        updateGamepadStatus(false);
        return;
    }

    // Process buttons
    processButtons(gamepad);

    // Process left stick
    processLeftStick(gamepad);
}

function processButtons(gamepad) {
    const buttons = gamepad.buttons;

    // LT - Left Trigger (analog, uses value)
    setButtonState(elements.lt, buttons[GAMEPAD_BUTTONS.LT]?.value > CONFIG.triggerThreshold);

    // LB - Left Bumper
    setButtonState(elements.lb, buttons[GAMEPAD_BUTTONS.LB]?.pressed);

    // LS - Left Stick Click
    setButtonState(elements.ls, buttons[GAMEPAD_BUTTONS.LS]?.pressed);

    // D-Pad
    setButtonState(elements.dpadUp, buttons[GAMEPAD_BUTTONS.DPAD_UP]?.pressed);
    setButtonState(elements.dpadDown, buttons[GAMEPAD_BUTTONS.DPAD_DOWN]?.pressed);
    setButtonState(elements.dpadLeft, buttons[GAMEPAD_BUTTONS.DPAD_LEFT]?.pressed);
    setButtonState(elements.dpadRight, buttons[GAMEPAD_BUTTONS.DPAD_RIGHT]?.pressed);

    // Menu buttons
    setButtonState(elements.viewBtn, buttons[GAMEPAD_BUTTONS.VIEW]?.pressed);
    setButtonState(elements.menuBtn, buttons[GAMEPAD_BUTTONS.MENU]?.pressed);
    setButtonState(elements.xboxBtn, buttons[GAMEPAD_BUTTONS.XBOX]?.pressed);

    // Back Paddles (Elite 2 - 2 left-side paddles only)
    // Remapped via Xbox Accessories app:
    // P1 → B (Crouch)
    // P2 → RB (Tactical)
    setButtonState(elements.p1, buttons[GAMEPAD_BUTTONS.B]?.pressed);
    setButtonState(elements.p2, buttons[GAMEPAD_BUTTONS.RB]?.pressed);
}

function processLeftStick(gamepad) {
    const x = gamepad.axes[GAMEPAD_AXES.LS_X] || 0;
    const y = gamepad.axes[GAMEPAD_AXES.LS_Y] || 0;

    // Apply deadzone
    const magnitude = Math.sqrt(x * x + y * y);
    let adjustedX = 0;
    let adjustedY = 0;

    if (magnitude > CONFIG.stickDeadzone) {
        const normalizedMagnitude = (magnitude - CONFIG.stickDeadzone) / (1 - CONFIG.stickDeadzone);
        adjustedX = (x / magnitude) * normalizedMagnitude;
        adjustedY = (y / magnitude) * normalizedMagnitude;
    }

    // Move stick visually
    if (elements.ls) {
        const translateX = adjustedX * CONFIG.stickRange;
        const translateY = adjustedY * CONFIG.stickRange;
        elements.ls.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
}

function setButtonState(element, pressed) {
    if (!element) return;

    if (pressed) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
}

// ============================================
// Mouse Handling
// ============================================

function setupMouseListeners() {
    // Note: For OBS Browser Source, mouse events may need special handling
    // The overlay needs to receive focus/events

    // Mouse button events
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Scroll events
    document.addEventListener('wheel', handleWheel, { passive: true });

    // Mouse movement (sensor)
    document.addEventListener('mousemove', handleMouseMove);

    // Context menu prevention (for right-click detection)
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Pointer lock for better mouse tracking in OBS (optional)
    document.addEventListener('click', () => {
        // Uncomment to enable pointer lock on click:
        // document.body.requestPointerLock();
    });
}

function handleMouseDown(e) {
    switch (e.button) {
        case 0: // Left click
            setButtonState(elements.mouseLeft, true);
            break;
        case 1: // Middle click
            setButtonState(elements.mouseMiddle, true);
            break;
        case 2: // Right click
            setButtonState(elements.mouseRight, true);
            break;
        case 3: // Back (Button 4)
            setButtonState(elements.mouse4, true);
            break;
        case 4: // Forward (Button 5)
            setButtonState(elements.mouse5, true);
            break;
    }
}

function handleMouseUp(e) {
    switch (e.button) {
        case 0:
            setButtonState(elements.mouseLeft, false);
            break;
        case 1:
            setButtonState(elements.mouseMiddle, false);
            break;
        case 2:
            setButtonState(elements.mouseRight, false);
            break;
        case 3:
            setButtonState(elements.mouse4, false);
            break;
        case 4:
            setButtonState(elements.mouse5, false);
            break;
    }
}

function handleWheel(e) {
    if (e.deltaY < 0) {
        // Scroll up
        flashButton(elements.scrollUp);
    } else if (e.deltaY > 0) {
        // Scroll down
        flashButton(elements.scrollDown);
    }
}

function flashButton(element) {
    if (!element) return;

    element.classList.add('active');
    setTimeout(() => {
        element.classList.remove('active');
    }, 100);
}

function handleMouseMove(e) {
    const now = Date.now();
    state.lastMouseMove = now;

    // Activate sensor
    if (elements.sensor) {
        elements.sensor.classList.add('active');
    }

    // Clear existing timer
    if (state.sensorTimer) {
        clearTimeout(state.sensorTimer);
    }

    // Deactivate sensor after timeout
    state.sensorTimer = setTimeout(() => {
        if (elements.sensor && Date.now() - state.lastMouseMove >= CONFIG.sensorTimeout) {
            elements.sensor.classList.remove('active');
        }
    }, CONFIG.sensorTimeout);
}

// ============================================
// Utility Functions
// ============================================

// Toggle debug panel visibility
function toggleDebug() {
    CONFIG.debug = !CONFIG.debug;
    if (elements.statusPanel) {
        elements.statusPanel.classList.toggle('hidden', !CONFIG.debug);
    }
}

// Manual button test (for debugging)
function testButton(buttonId) {
    const element = document.getElementById(buttonId);
    if (element) {
        element.classList.add('active');
        setTimeout(() => element.classList.remove('active'), 200);
    }
}

// ============================================
// Start
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose functions for debugging in console
window.coastOverlay = {
    toggleDebug,
    testButton,
    config: CONFIG,
    state: state
};
