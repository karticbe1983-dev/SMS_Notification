import dotenv from 'dotenv';
import Configuration from '../models/Configuration.js';

dotenv.config();

/**
 * Configuration Manager Service
 * Handles loading and managing system configuration
 */
class ConfigurationManager {
  constructor() {
    this.config = null;
  }

  /**
   * Load and validate configuration
   * @returns {Configuration} The loaded and validated configuration
   * @throws {Error} If configuration is invalid
   */
  load() {
    // Create new configuration instance
    this.config = new Configuration();
    
    // Load from environment variables
    this.config.loadFromEnvironment();
    
    // Validate configuration
    const validationResult = this.config.validate();
    
    if (!validationResult.isValid) {
      const errorMessage = 'Configuration validation failed:\n' + 
        validationResult.errors.map(err => `  - ${err}`).join('\n');
      throw new Error(errorMessage);
    }
    
    return this.config;
  }

  /**
   * Get the current configuration
   * @returns {Configuration} The current configuration
   * @throws {Error} If configuration hasn't been loaded
   */
  getConfig() {
    if (!this.config) {
      throw new Error('Configuration has not been loaded. Call load() first.');
    }
    return this.config;
  }

  /**
   * Reload configuration from environment
   * @returns {Configuration} The reloaded configuration
   */
  reload() {
    return this.load();
  }
}

// Export singleton instance
export default new ConfigurationManager();
