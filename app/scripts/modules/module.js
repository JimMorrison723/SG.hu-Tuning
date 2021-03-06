export class Module {

  constructor(name, active = false) {
    this.moduleName = name
    this.active = active
  }

  get getStatus() {
    return this.active
  }

  get getName() {
    return this.moduleName
  }

  get toggleStatus() {
    return this.active ? this.active = false : this.active = true
  }

  activated () {

  }
}