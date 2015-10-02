(function() {
  function Slider(input, options) {
    input = typeof input === 'string' ? document.querySelector(input) : input;
    options = options || {};

    this.initOptions_(input, options);

    this.input = input;
    this.dragging = false;
    this.touching = false;
    this.value = this.options.value;
    this.min = this.options.min;
    this.max = this.options.max;
    this.step = this.options.step;
    this.range = this.max - this.min;

    // The maximum value possible given the min value and the step value may be
    // less than max.
    this.stepMax = this.min + Math.floor(this.range / this.step) * this.step;

    // Value should never be more than the max value possible to reach using
    // the step value.
    this.value = Math.min(this.value, this.stepMax);

    this.hideInput_();
    this.createElements_();
    this.addEventListeners_();

    this.setValue_(this.value);
  }

  /**
   * @params {Object} options
   */
  Slider.prototype.initOptions_ = function(input, options) {
    this.options = {};

    var rangeValues = {
      value: 1,
      min: 1,
      max: 100,
      step: 1,
    };

    var classNames = {
      container: 'aria-slider',
      bar: 'aria-slider__bar',
      track: 'aria-slider__track',
      handle: 'aria-slider__handle'
    };

    if (options.label && typeof options.label === 'string') {
      this.options.label = options.label;
    }

    if (options.labelledBy && typeof options.labelledBy === 'string') {
      this.options.labelledBy = options.labelledBy;
    }

    for (var key in rangeValues) {
      this.options[key] = options[key];
      if (typeof this.options[key] === 'number' && isNaN(this.options[key]) === false) {
        continue;
      }

      this.options[key] = parseInt(input.getAttribute(key), 10);
      if (typeof this.options[key] === 'number' && isNaN(this.options[key]) === false) {
        continue;
      }

      this.options[key] = rangeValues[key];
    }

    this.options.classNames = {};
    for (var key in classNames) {
      var className = classNames[key];

      if (options.classNames && typeof options.classNames[key] === 'string') {
        className = options.classNames[key];
      }

      this.options.classNames[key] = className;
    }
  }

  /**
   * @param {Number} value
   */
  Slider.prototype.setValue_ = function(value) {
    value = Math.max(value, this.min);
    value = Math.min(value, this.stepMax);

    var range = this.max - this.min;
    var percentage = 100 * ((value - this.min) / range);
    percentage = Math.round(percentage);
    percentage = Math.max(0, percentage);
    percentage = Math.min(100, percentage);

    this.value = value;
    this.percentage = percentage;
    this.input.setAttribute('value', value);
    this.container.setAttribute('aria-valuenow', value);

    this.handle.style.left = percentage + '%';
  }

  Slider.prototype.stepDown_ = function() {
    this.setValue_(this.value - this.step);
  }

  Slider.prototype.stepUp_ = function() {
    this.setValue_(this.value + this.step);
  }

  /**
   * @param {Number} percentage
   */
  Slider.prototype.setPercentage_ = function(percentage) {
    percentage = Math.max(0, percentage);
    percentage = Math.min(100, percentage);

    var range = this.max - this.min;
    var value = (range / 100) * percentage;

    // Convert the value to match the step value.
    value = Math.round(value / this.step) * this.step;
    value = this.min + value;

    this.setValue_(value);
  }

  Slider.prototype.hideInput_ = function() {
    this.input.setAttribute('tabindex', '-0');
    this.input.style.display = 'none';  // TODO: Does this break anything?
    this.input.style.width = 0;
    this.input.style.height = 0;
    this.input.style.border = 0;
    this.input.style.margin = 0;
    this.input.style.padding = 0;
    this.input.style.opacity = 0;
  }

  Slider.prototype.createElements_ = function() {
    this.container = document.createElement('div');
    this.container.className = this.options.classNames.container;
    this.container.setAttribute('tabindex', '0');
    this.container.setAttribute('role', 'slider');
    this.container.setAttribute('aria-valuemin', this.min);
    this.container.setAttribute('aria-valuemax', this.stepMax);
    this.container.setAttribute('aria-valuenow', this.value);

    if (this.options.label) {
      this.container.setAttribute('aria-label', this.options.label);
    }
    
    if (this.options.labelledBy) {
      this.container.setAttribute('aria-labelledby', this.options.labelledBy);
    }

    this.bar = document.createElement('div');
    this.bar.className = this.options.classNames.bar;
    this.container.appendChild(this.bar);

    this.track = document.createElement('div');
    this.track.className = this.options.classNames.track;
    this.bar.appendChild(this.track);

    this.handle = document.createElement('div');
    this.handle.className = this.options.classNames.handle;
    this.track.appendChild(this.handle);

    // Style the elements before inserting them in the document.
    this.track.style.position = 'relative';
    this.handle.style.position = 'absolute';

    // Wrap the slider container around the input element.
    this.input.parentNode.insertBefore(this.container, this.input);
    this.container.appendChild(this.input);
  }

  Slider.prototype.addEventListeners_ = function() {
    this.container.addEventListener(
        'keydown', this.handleContainerKeyDown_.bind(this));

    this.track.addEventListener('click', this.handleTrackClick_.bind(this));

    this.handle.addEventListener('click', this.handleHandleClick_.bind(this));
    this.handle.addEventListener(
        'mousedown', this.handleHandleMouseDown_.bind(this));

    window.addEventListener(
        'mousemove', this.handleWindowMouseMove_.bind(this));
    window.addEventListener('mouseup', this.handleWindowMouseUp_.bind(this));
    window.addEventListener('blur', this.handleWindowBlur_.bind(this));

    // TODO: Touch/Pointer events...
    this.track.addEventListener('touchstart', this.handleTrackTouch_.bind(this));

    this.handle.addEventListener(
        'touchstart', this.handleHandleTouchStart_.bind(this));

    window.addEventListener(
        'touchmove', this.handleWindowTouchMove_.bind(this));
    window.addEventListener('touchend', this.handleWindowTouchEnd_.bind(this));
    
    
  }

  /**
   * @param {KeyboardEvent} event
   */
  Slider.prototype.handleContainerKeyDown_ = function(event) {
    // Left or down.
    if (event.keyCode == 37 || event.keyCode == 40) {
      this.stepDown_();
      event.preventDefault();
    }

    // Right or up.
    if (event.keyCode == 39 || event.keyCode == 38) {
      this.stepUp_();
      event.preventDefault();
    }

    // Page down.
    if (event.keyCode == 34) {
      this.setPercentage_(this.percentage - 10);
      event.preventDefault();
    }

    // Page up.
    if (event.keyCode == 33) {
      this.setPercentage_(this.percentage + 10);
      event.preventDefault();
    }

    // Home.
    if (event.keyCode == 36) {
      this.setValue_(this.min);
      event.preventDefault();
    }

    // End.
    if (event.keyCode == 35) {
      this.setValue_(this.stepMax);
      event.preventDefault();
    }

    this.dispatchEvent_();
  }

  Slider.prototype.handleTrackClick_ = function(event) {
    var trackRect = this.track.getBoundingClientRect();
    var x = event.clientX - trackRect.left;
    var y = event.clientY - trackRect.top;

    var percentage = (100 / trackRect.width) * x;
    this.setPercentage_(percentage);

    this.dispatchEvent_();
  }

  Slider.prototype.handleTrackTouch_ = function(event) {
    event.preventDefault();

    var trackRect = this.track.getBoundingClientRect();
    var x = event.targetTouches[0].clientX - trackRect.left;
    var y = event.targetTouches[0].clientY - trackRect.top;

    var percentage = (100 / trackRect.width) * x;
    this.setPercentage_(percentage);

    this.dispatchEvent_();
  }

  Slider.prototype.handleHandleClick_ = function(event) {
    event.stopPropagation();
  }

  Slider.prototype.handleHandleTouchStart_ = function(event) {
    this.touching = true;
    event.preventDefault();
  }

  Slider.prototype.handleHandleMouseDown_ = function(event) {
    if (this.touching) {
      return;
    }

    this.dragging = true;
    event.preventDefault();
  }

  Slider.prototype.handleWindowTouchMove_ = function(event) {
    if (this.touching === false) {
      return;
    }

    var trackRect = this.track.getBoundingClientRect();
    var x = event.targetTouches[0].clientX - trackRect.left;
    var y = event.targetTouches[0].clientY - trackRect.top;

    var percentage = (100 / trackRect.width) * x;
    this.setPercentage_(percentage);
  }

  Slider.prototype.handleWindowMouseMove_ = function(event) {
    if (this.dragging === false) {
      return;
    }

    var trackRect = this.track.getBoundingClientRect();
    var x = event.clientX - trackRect.left;
    var y = event.clientY - trackRect.top;

    var percentage = (100 / trackRect.width) * x;
    this.setPercentage_(percentage);
  }

  Slider.prototype.handleWindowMouseUp_ = function(event) {
    if (this.dragging) {
      this.dispatchEvent_();
    }

    this.dragging = false;
  }

  Slider.prototype.handleWindowTouchEnd_ = function(event) {
    if (this.touching) {
      this.dispatchEvent_();
    }

    this.touching = false;
  }

  Slider.prototype.handleWindowBlur_ = function(event) {
    if (this.dragging) {
      this.dispatchEvent_();
    }

    this.dragging = false;
  }

  Slider.prototype.dispatchEvent_ = function() {
    var event = new Event('change', {
      'view': window,
      'bubbles': true,
      'cancelable': false
    });

    this.input.dispatchEvent(event);
  }

  // Make Slider accessible globally when included in a browser.
  if (typeof window !== 'undefined') {
    window.AriaRangeSlider = Slider;
  }

  // Expose Slider as a CJS module.
  if (typeof exports === 'object') {
    module.exports = Slider;
  }

  return Slider;
})(this);
