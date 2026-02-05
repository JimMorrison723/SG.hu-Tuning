/**
 * Base Module class for all feature modules
 *
 * Modules are dynamically extended with additional properties
 * at runtime, so we use index signature to allow that.
 */
export class Module {
  moduleName: string
  active: boolean

  // Allow dynamic properties for module-specific methods and data
  [key: string]: unknown

  constructor(name: string, active = false) {
    this.moduleName = name
    this.active = active
  }

  /**
   * Called when the module should be activated
   * Override in module instances
   */
  activate(): void {
    // Override in module instances
  }

  /**
   * Called when the module should be disabled
   * Override in module instances for cleanup
   */
  disable?(): void
}
