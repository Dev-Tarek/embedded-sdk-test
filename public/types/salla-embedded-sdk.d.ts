/**
 * Auth module interface.
 */
export declare interface AuthModule {
    /**
     * Get the current access token.
     * @returns The access token or undefined if not authenticated
     */
    getAccessToken(): string | undefined;
    /**
     * Check if the SDK is authenticated.
     */
    isAuthenticated(): boolean;
    /**
     * Get the current store ID.
     */
    getStoreId(): number | undefined;
    /**
     * Get the current user ID.
     */
    getUserId(): number | undefined;
    /**
     * Get the merchant plan.
     */
    getMerchantPlan(): string | undefined;
    /**
     * Request a token refresh from the host.
     */
    refreshToken(): void;
}

/**
 * Breadcrumb item.
 */
export declare interface BreadcrumbItem {
    label: string;
    path?: string;
}

export declare const embedded: EmbeddedApp;

/**
 * Main Embedded SDK class.
 * Provides the primary interface for third-party apps to communicate with the Salla host.
 */
export declare class EmbeddedApp {
    private config;
    private state;
    /** Auth module for token management */
    auth: AuthModule;
    /** Page module for loading, overlay, navigation */
    page: PageModule;
    /** Nav module for primary actions */
    nav: NavModule;
    constructor();
    /**
     * Get current SDK state.
     */
    getState(): Readonly<EmbeddedState>;
    /**
     * Get current SDK configuration.
     */
    getConfig(): Readonly<EmbeddedConfig>;
    /**
     * Check if SDK is ready.
     */
    isReady(): boolean;
    /**
     * Log debug messages if debug mode is enabled.
     */
    private log;
    /**
     * Log warnings.
     */
    private warn;
    /**
     * Initialize the SDK and establish connection with the host.
     *
     * @param options - Initialization options
     * @returns Promise that resolves when SDK is ready
     *
     * @example
     * ```typescript
     * await salla.embedded.init({
     *   app_id: 'my-app-123',
     *   env: 'prod',
     *   debug: true
     * });
     * ```
     */
    init(options: InitOptions): Promise<EmbeddedState>;
    /**
     * Wait for the SDK to be ready.
     * Useful when multiple calls to init() might happen.
     */
    private waitForReady;
    /**
     * Destroy the SDK instance and clean up resources.
     */
    destroy(): void;
}

/**
 * Internal configuration after initialization.
 */
declare interface EmbeddedConfig {
    appId: string;
    env: Environment;
    debug: boolean;
    initialized: boolean;
}

/**
 * Current state of the embedded SDK.
 */
export declare interface EmbeddedState {
    /** Whether the SDK is ready and authenticated */
    ready: boolean;
    /** Whether initialization is in progress */
    initializing: boolean;
    /** Authentication token from the host */
    token?: string;
    /** Store ID from merchant context */
    storeId?: number;
    /** User ID from merchant context */
    userId?: number;
    /** Merchant plan */
    merchantPlan?: string;
    /** Current dark mode state */
    isDarkMode?: boolean;
    /** Parent window width */
    parentWidth?: number;
    /** Base URL of the host */
    baseUrl?: string;
    /** Base API URL */
    baseApiUrl?: string;
}

/**
 * @fileoverview Core type definitions for the Embedded SDK.
 */
/**
 * Environment mode for the SDK.
 */
export declare type Environment = "prod" | "dev";

/**
 * Extended action for navigation.
 */
export declare interface ExtendedAction {
    title: string;
    url?: string;
}

/**
 * Get the singleton EmbeddedApp instance.
 */
export declare function getEmbeddedApp(): EmbeddedApp;

/**
 * Options for initializing the embedded SDK.
 */
export declare interface InitOptions {
    /** The unique identifier for the app */
    app_id: string;
    /** Environment mode (defaults to 'prod') */
    env?: Environment;
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Loading mode for the page.
 */
export declare type LoadingMode = "full" | "component";

/**
 * Nav module interface.
 */
export declare interface NavModule {
    /**
     * Set the primary action button in the navigation.
     *
     * @param config - Primary action configuration
     *
     * @example
     * ```typescript
     * salla.embedded.nav.primaryAction({
     *   title: 'Create Product',
     *   url: '/products/create',
     *   extendedActions: [
     *     { title: 'Import Products', url: '/products/import' },
     *     { title: 'Bulk Edit', url: '/products/bulk-edit' }
     *   ]
     * });
     * ```
     */
    primaryAction(config: PrimaryActionConfig): void;
    /**
     * Clear the primary action button.
     */
    clearPrimaryAction(): void;
}

/**
 * Navigation options.
 */
export declare interface NavToOptions {
    /** Navigation mode */
    mode?: "iframe" | "redirect";
}

/**
 * Overlay action.
 */
export declare type OverlayAction = "open" | "close";

/**
 * Page module interface.
 */
export declare interface PageModule {
    /**
     * Set the loading state of the page.
     *
     * @param status - true to show loading complete, false for loading
     * @param mode - Loading mode ('full' or 'component')
     *
     * @example
     * ```typescript
     * // Show loading
     * salla.embedded.page.loading(false);
     *
     * // Hide loading (content ready)
     * salla.embedded.page.loading(true);
     * ```
     */
    loading(status: boolean, mode?: LoadingMode): void;
    /**
     * Control the overlay state.
     *
     * @param action - 'open' or 'close'
     *
     * @example
     * ```typescript
     * salla.embedded.page.overlay('open');
     * // ... show modal content
     * salla.embedded.page.overlay('close');
     * ```
     */
    overlay(action: OverlayAction): void;
    /**
     * Navigate to a path.
     *
     * @param path - The path to navigate to
     * @param options - Navigation options
     *
     * @example
     * ```typescript
     * salla.embedded.page.navTo('/products');
     * salla.embedded.page.navTo('https://external.com', { mode: 'redirect' });
     * ```
     */
    navTo(path: string, options?: NavToOptions): void;
    /**
     * Update the iframe height.
     *
     * @param height - Height in pixels
     */
    resize(height: number): void;
    /**
     * Set breadcrumb items.
     *
     * @param items - Array of breadcrumb items
     *
     * @example
     * ```typescript
     * salla.embedded.page.setBreadcrumbs([
     *   { label: 'Home', path: '/' },
     *   { label: 'Products', path: '/products' },
     *   { label: 'Current Product' }
     * ]);
     * ```
     */
    setBreadcrumbs(items: BreadcrumbItem[]): void;
}

/**
 * Primary action configuration.
 */
export declare interface PrimaryActionConfig {
    /** Button title */
    title: string;
    /** URL to navigate to when clicked (optional) */
    url?: string;
    /** Custom value to send back on click */
    value?: string;
    /** Extended actions for dropdown menu */
    extendedActions?: ExtendedAction[];
}

/**
 * Reset the singleton (mainly for testing).
 */
export declare function resetEmbeddedApp(): void;

export declare const version = "0.1.0";

export { }
