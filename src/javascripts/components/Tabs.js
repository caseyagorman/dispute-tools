import Widget from '../lib/widget';

export default class Tabs extends Widget {
  constructor(config) {
    super(config);

    this.initialSearch = location.search;
    this.panelPrefixRef = new RegExp(/^panel-/);
    this.tabs = Array.prototype.slice.call(
      this.element.querySelectorAll('[role="tab"]'),
    );
    this.panels = Array.prototype.slice.call(
      this.element.querySelectorAll('[role="tabpanel"]'),
    );
    this._current = '';

    this._bindEvents();
  }

  run() {
    if (this.updateHash) {
      const ids = this.panels.map(p => p.id);
      const hash = `panel-${window.location.hash.replace('#', '')}`;

      if (ids.indexOf(hash) >= 0) {
        return this._activateTab(hash);
      }
    }

    if (this.defaultTab) {
      return this._activateTab(this.defaultTab);
    }

    return this;
  }

  _bindEvents() {
    this._tabClickHandlerRef = this._tabClickHandler.bind(this);
    for (let i = 0, len = this.tabs.length; i < len; i++) {
      this.tabs[i].addEventListener('click', this._tabClickHandlerRef);
    }
  }

  _tabClickHandler(ev) {
    const id = ev.currentTarget.getAttribute('aria-controls');
    this._activateTab(id);
  }

  /**
   * Activates a new Tab and its related Panel.
   * @private
   * @emits {change} emit event when the current active tab has changed.
   * @chainable
   */
  _activateTab(id) {
    if (this._current === id) {
      return this;
    }

    for (let i = 0, len = this.tabs.length; i < len; i++) {
      this.tabs[i].setAttribute('aria-selected', false);
      this.panels[i].setAttribute('aria-hidden', true);

      if (id === this.tabs[i].getAttribute('aria-controls')) {
        this.tabs[i].setAttribute('aria-selected', true);
        this.panels[i].setAttribute('aria-hidden', false);

        if (this.updateHash) {
          let q = '';

          if (typeof this.tabs[i].dataset.keepParams !== 'undefined') {
            this.tabs[i].dataset._search =
              this.tabs[i].dataset._search || this.initialSearch;
          }

          q =
            this.tabs[i].dataset.keepParams === 'undefined'
              ? ''
              : this.tabs[i].dataset._search || '';

          const url = `${location.pathname}${q}#${id.replace(
            this.panelPrefixRef,
            '',
          )}`;

          history.replaceState({ path: url }, '', url);
        }

        this._current = id;
        this.dispatch('change', {
          id,
          tab: this.tabs[i],
          panel: this.panels[i],
        });
      }
    }

    return this;
  }
}
