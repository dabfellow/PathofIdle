/**
 * Utility to check if a module is loading correctly and what it exports
 */

// Function to check module exports
export async function checkModuleExports(modulePath) {
    try {
        console.log(`Checking module: ${modulePath}`);
        const module = await import(modulePath);
        console.log(`Module loaded successfully. Exports:`, Object.keys(module));
        return {
            success: true,
            exports: Object.keys(module),
            module: module
        };
    } catch (error) {
        console.error(`Failed to load module: ${modulePath}`, error);
        return {
            success: false,
            error: error.toString()
        };
    }
}

// Make it available in global scope for console debugging
window.checkModuleExports = checkModuleExports;

// Add a helper to specifically check the random.js module
window.checkRandomModule = function() {
    return checkModuleExports('../utils/random.js');
};

// Check the random.js module on load
window.addEventListener('load', function() {
    console.log("Debug module checker loaded. Testing random.js...");
    window.checkRandomModule()
        .then(result => {
            if (result.success) {
                console.log(`✓ random.js loaded with exports: ${result.exports.join(', ')}`);
                console.log(`Does it have chance? ${result.exports.includes('chance') ? 'YES' : 'NO'}`);
            } else {
                console.error(`✗ Failed to load random.js`);
            }
        });
});

console.log("Module checker loaded. Use window.checkModuleExports(modulePath) to check a module's exports.");
