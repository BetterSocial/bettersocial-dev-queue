module.exports = class ModelFactory {
  /**
   *
   * @param {import('sequelize').ModelStatic<import('sequelize').Model>} model
   * @param {Record<string,Function>} states
   * @param {string} currentState
   * @param {number} n
   */
  constructor(model, states = {}, currentState = 'default', n = 1) {
    if (!states.default) {
      throw new Error('states must have a default key');
    }

    this.model = model;
    this.states = states;
    this.currentState = currentState;
    this.n = n;
  }

  /**
   *
   * @param {string} state
   * @returns {ModelFactory} self
   */
  state(state) {
    return new ModelFactory(this.model, this.states, state, this.n);
  }

  /**
   *
   * @param {number} n
   * @returns {ModelFactory} self
   */
  count(n) {
    this.n = n;
    return this;
  }

  /**
   *
   * @param {Object} overrides
   * @returns
   */
  create(overrides = {}) {
    const makeData = (idx = 0) => {
      // prepare data from default, state, and overrides
      let data = this.states.default();
      if (this.currentState !== 'default') {
        data = Object.assign(data, this.states[this.currentState]());
      }
      data = Object.assign(data, overrides);

      // run callback properties
      Object.keys(data).forEach((key) => {
        data[key] = typeof data[key] === 'function' ? data[key](data, idx) : data[key];
      }, data);

      return data;
    };

    return this.n === 1
      ? this.model.create(makeData())
      : this.model.bulkCreate(Array.from({length: this.n}, (_, idx) => makeData(idx)));
  }
};
