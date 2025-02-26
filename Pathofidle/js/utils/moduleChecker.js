/**
 * Simple utility to check if modules and their exports are available
 * Include this file in your HTML to help debug module loading issues
 */
export function checkModule(modulePath) {
    try {
        import(modulePath).then(module => {
            console.log(`✅ Module loaded successfully: ${modulePath}`);
            console.log('Exported properties:', Object.keys(module));
            return module;
        }).catch(error => {
            console.error(`❌ Failed to load module: ${modulePath}`);
            console.error(error);
            return null;
        });
    } catch (error) {
        console.error(`❌ Error checking module: ${modulePath}`);
        console.error(error);
        return null;
    }
}

// For debugging purposes, you can uncomment this line:
// window.checkModule = checkModule;
