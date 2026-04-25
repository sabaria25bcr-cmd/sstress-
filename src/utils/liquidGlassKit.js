/**
 * liquidGlassKit.js
 * converted to exportable module for React integration
 */
export const initLiquidGlass = () => {
  "use strict";

  function emit(el, name, detail) {
    el.dispatchEvent(
      new CustomEvent("glass:" + name, { bubbles: true, detail: detail || {} })
    );
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), " +
        "select:not([disabled]), textarea:not([disabled]), " +
        '[tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function trapFocus(container, evt) {
    var focusable = getFocusable(container);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (evt.key === "Tab") {
      if (evt.shiftKey && document.activeElement === first) {
        evt.preventDefault();
        last.focus();
      } else if (!evt.shiftKey && document.activeElement === last) {
        evt.preventDefault();
        first.focus();
      }
    }
  }

  /* GlassTheme */
  var GlassTheme = {
    init: function () {
      var btn = document.getElementById("theme-toggle");
      var root = document.documentElement;
      var key = "glass-theme";
      var saved = localStorage.getItem(key);
      if (saved) root.setAttribute("data-theme", saved);

      if (btn) {
        btn.addEventListener("click", function () {
          var next =
            root.getAttribute("data-theme") === "light" ? "dark" : "light";
          root.setAttribute("data-theme", next);
          localStorage.setItem(key, next);
          emit(root, "theme:change", { theme: next });
        });
      }
    }
  };

  /* GlassModal */
  function GlassModal(backdropEl) {
    this.backdrop = backdropEl;
    this.modal = backdropEl.querySelector(".glass-modal");
    this._onKey = this._handleKey.bind(this);
    this._bindTriggers();
  }

  GlassModal.prototype._bindTriggers = function () {
    var self = this;
    document.querySelectorAll("[data-modal-open], #modal-open").forEach(function (el) {
      el.addEventListener("click", function () { self.open(); });
    });
    this.backdrop.querySelectorAll('[id^="modal-close"], [id^="modal-confirm"], [id^="modal-cancel"]').forEach(function (el) {
      el.addEventListener("click", function () { self.close(); });
    });
    this.backdrop.addEventListener("click", function (evt) {
      if (evt.target === self.backdrop) self.close();
    });
  };

  GlassModal.prototype.open = function () {
    this._lastFocus = document.activeElement;
    this.backdrop.removeAttribute("inert");
    this.backdrop.classList.add("is-open");
    document.addEventListener("keydown", this._onKey);
    var self = this;
    setTimeout(function () {
      var focusable = getFocusable(self.modal);
      if (focusable.length) focusable[0].focus();
    }, 50);
    emit(this.backdrop, "modal:open");
  };

  GlassModal.prototype.close = function () {
    this.backdrop.classList.remove("is-open");
    this.backdrop.setAttribute("inert", "");
    document.removeEventListener("keydown", this._onKey);
    if (this._lastFocus) this._lastFocus.focus();
    emit(this.backdrop, "modal:close");
  };

  GlassModal.prototype._handleKey = function (evt) {
    if (evt.key === "Escape") { this.close(); return; }
    trapFocus(this.modal, evt);
  };

  GlassModal.init = function () {
    var backdrop = document.getElementById("modal-backdrop");
    if (backdrop) new GlassModal(backdrop);
  };

  /* GlassTabs */
  function GlassTabs(containerEl) {
    this.container = containerEl;
    this.tabs = Array.from(containerEl.querySelectorAll(".glass-tab"));
    this.panels = Array.from(containerEl.querySelectorAll(".glass-tab-panel"));
    this._bind();
  }

  GlassTabs.prototype._bind = function () {
    var self = this;
    this.tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { self.activate(i); });
      tab.addEventListener("keydown", function (evt) {
        if (evt.key === "ArrowRight") {
          evt.preventDefault();
          self.activate((i + 1) % self.tabs.length);
          self.tabs[(i + 1) % self.tabs.length].focus();
        }
        if (evt.key === "ArrowLeft") {
          evt.preventDefault();
          var prev = (i - 1 + self.tabs.length) % self.tabs.length;
          self.activate(prev);
          self.tabs[prev].focus();
        }
        if (evt.key === "Home") { evt.preventDefault(); self.activate(0); self.tabs[0].focus(); }
        if (evt.key === "End") { evt.preventDefault(); self.activate(self.tabs.length - 1); self.tabs[self.tabs.length - 1].focus(); }
      });
    });
  };

  GlassTabs.prototype.activate = function (index) {
    this.tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute("aria-selected", String(on));
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    this.panels.forEach(function (p, i) {
      if (i === index) p.classList.add("is-active");
      else p.classList.remove("is-active");
    });
    emit(this.container, "tabs:change", { index: index });
  };

  GlassTabs.init = function () {
    document.querySelectorAll(".glass-tabs").forEach(function (el) { new GlassTabs(el); });
  };

  /* GlassAccordion */
  function GlassAccordion(containerEl) {
    this.container = containerEl;
    this._bind();
  }

  GlassAccordion.prototype._bind = function () {
    this.container.querySelectorAll(".glass-accordion-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var item = trigger.closest(".glass-accordion-item");
        if (!item) return;
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
        emit(item, "accordion:toggle", { open: !isOpen });
      });
      trigger.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter" || evt.key === " ") { evt.preventDefault(); trigger.click(); }
      });
    });
  };

  GlassAccordion.init = function () {
    document.querySelectorAll(".glass-accordion").forEach(function (el) { new GlassAccordion(el); });
  };

  /* GlassDropdown */
  function GlassDropdown(containerEl) {
    this.container = containerEl;
    this.trigger = containerEl.querySelector(".glass-dropdown-trigger");
    this.menu = containerEl.querySelector(".glass-dropdown-menu");
    this._onOutside = this._closeOnOutside.bind(this);
    this._bind();
  }

  GlassDropdown.prototype._bind = function () {
    var self = this;
    if (this.trigger) {
      this.trigger.addEventListener("click", function (evt) { evt.stopPropagation(); self.toggle(); });
      this.trigger.addEventListener("keydown", function (evt) {
        if (evt.key === "ArrowDown") { evt.preventDefault(); self.open(); self._focusFirst(); }
        if (evt.key === "Escape") self.close();
      });
    }
    if (this.menu) {
      this.menu.querySelectorAll(".glass-dropdown-item").forEach(function (item) {
        item.addEventListener("click", function () { self.close(); });
        item.addEventListener("keydown", function (evt) {
          if (evt.key === "Escape") { self.close(); self.trigger && self.trigger.focus(); }
          if (evt.key === "ArrowDown") {
            evt.preventDefault();
            var next = item.nextElementSibling;
            while (next && next.classList.contains("glass-dropdown-divider")) next = next.nextElementSibling;
            if (next) next.focus();
          }
          if (evt.key === "ArrowUp") {
            evt.preventDefault();
            var prev = item.previousElementSibling;
            while (prev && prev.classList.contains("glass-dropdown-divider")) prev = prev.previousElementSibling;
            if (prev) prev.focus();
            else self.trigger && self.trigger.focus();
          }
        });
      });
    }
  };

  GlassDropdown.prototype.open = function () {
    this.container.classList.add("is-open");
    this.trigger && this.trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", this._onOutside);
    document.addEventListener("keydown", (this._onKey = function (evt) { if (evt.key === "Escape") this.close(); }.bind(this)));
    emit(this.container, "dropdown:open");
  };

  GlassDropdown.prototype.close = function () {
    this.container.classList.remove("is-open");
    this.trigger && this.trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", this._onOutside);
    emit(this.container, "dropdown:close");
  };

  GlassDropdown.prototype.toggle = function () {
    this.container.classList.contains("is-open") ? this.close() : this.open();
  };

  GlassDropdown.prototype._focusFirst = function () {
    var first = this.menu && this.menu.querySelector(".glass-dropdown-item");
    if (first) setTimeout(function () { first.focus(); }, 20);
  };

  GlassDropdown.prototype._closeOnOutside = function (evt) {
    if (!this.container.contains(evt.target)) this.close();
  };

  GlassDropdown.init = function () {
    document.querySelectorAll(".glass-dropdown").forEach(function (el) { new GlassDropdown(el); });
  };

  /* GlassToast */
  var GlassToast = {
    ICONS: { success: "✓", error: "✕", warning: "⚠", info: "ℹ" },
    LABELS: { success: "Success", error: "Error", warning: "Warning", info: "Info" },
    show: function (type, title, desc, duration) {
      var region = document.getElementById("toast-region");
      if (!region) return;
      var toast = document.createElement("div");
      toast.className = "glass glass-toast glass-toast--" + type;
      toast.innerHTML = '<span class="glass-toast__icon">' + (this.ICONS[type] || "ℹ") + "</span>" +
        '<div class="glass-toast__body"><div class="glass-toast__title">' + (title || this.LABELS[type]) + "</div>" +
        (desc ? '<div class="glass-toast__desc">' + desc + "</div>" : "") + "</div>" +
        '<span class="glass-toast__close">✕</span>';
      region.appendChild(toast);
      var dismiss = function () {
        toast.classList.add("is-exiting");
        toast.addEventListener("animationend", function () { toast.remove(); }, { once: true });
      };
      toast.querySelector(".glass-toast__close").addEventListener("click", dismiss);
      if (duration !== 0) setTimeout(dismiss, duration || 4000);
    },
    init: function () {
      document.addEventListener("click", function (evt) {
        var btn = evt.target.closest("[data-toast]");
        if (!btn) return;
        GlassToast.show(btn.dataset.toast, btn.dataset.toastTitle, btn.dataset.toastDesc);
      });
    }
  };

  /* GlassStepper */
  var GlassStepper = {
    init: function () {
      var stepper = document.getElementById("stepper-h");
      var prevBtn = document.getElementById("stepper-prev");
      var nextBtn = document.getElementById("stepper-next");
      if (!stepper || !prevBtn || !nextBtn) return;
      var steps = Array.from(stepper.querySelectorAll(".glass-step"));
      var current = steps.findIndex(function (s) { return s.classList.contains("is-active"); });
      function update(idx) {
        steps.forEach(function (step, i) {
          step.classList.toggle("is-complete", i < idx);
          step.classList.toggle("is-active", i === idx);
          step.classList.toggle("is-pending", i > idx);
          var node = step.querySelector(".glass-step__node");
          if (node) node.textContent = (i < idx) ? "✓" : String(i + 1);
        });
        current = idx;
        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === steps.length - 1;
        emit(stepper, "stepper:change", { step: idx });
      }
      prevBtn.addEventListener("click", function () { if (current > 0) update(current - 1); });
      nextBtn.addEventListener("click", function () { if (current < steps.length - 1) update(current + 1); });
      update(current >= 0 ? current : 0);
    }
  };

  /* GlassNavTabs */
  var GlassNavTabs = {
    init: function () {
      document.querySelectorAll(".glass-nav").forEach(function (nav) {
        nav.addEventListener("click", function (evt) {
          var item = evt.target.closest(".glass-nav__item");
          if (!item) return;
          nav.querySelectorAll(".glass-nav__item").forEach(function (el) { el.classList.remove("glass-nav__item--active"); });
          item.classList.add("glass-nav__item--active");
        });
      });
    }
  };

  /* GlassRipple */
  var GlassRipple = {
    create: function (el, evt) {
      if (el.querySelectorAll("[data-ripple]").length > 3) return;
      var ripple = document.createElement("span");
      ripple.setAttribute("data-ripple", "");
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      var x = evt.clientX - rect.left - size / 2;
      var y = evt.clientY - rect.top - size / 2;
      Object.assign(ripple.style, {
        position: "absolute", left: x + "px", top: y + "px", width: size + "px", height: size + "px",
        borderRadius: "50%", background: "rgba(255,255,255,0.18)", transform: "scale(0)", pointerEvents: "none",
        animation: "ripple 600ms ease-out forwards", zIndex: "999"
      });
      el.appendChild(ripple);
      ripple.addEventListener("animationend", function () { ripple.remove(); }, { once: true });
    },
    init: function () {
      document.addEventListener("click", function (evt) {
        var target = evt.target.closest(".glass-btn, .glass-card");
        if (target) GlassRipple.create(target, evt);
      });
    }
  };

  /* GlassParallax */
  var GlassParallax = {
    init: function () {
      if (window.matchMedia("(hover: none)").matches) return;
      document.querySelectorAll(".glass-card").forEach(function (card) {
        card.addEventListener("mousemove", function (evt) {
          var rect = card.getBoundingClientRect();
          var dx = (evt.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          var dy = (evt.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          card.style.transform = "translateY(-6px) scale(1.01) rotateX(" + (-dy * 4) + "deg) rotateY(" + (dx * 4) + "deg)";
          card.style.transition = "none";
        });
        card.addEventListener("mouseleave", function () { card.style.transform = ""; card.style.transition = ""; });
      });
    }
  };

  /* Boot routine */
  function boot() {
    GlassTheme.init();
    GlassModal.init();
    GlassTabs.init();
    GlassAccordion.init();
    GlassDropdown.init();
    GlassToast.init();
    GlassStepper.init();
    GlassNavTabs.init();
    GlassRipple.init();
    GlassParallax.init();
  }

  boot();
};
