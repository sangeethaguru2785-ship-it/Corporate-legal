/* ============================================
   STACKLY — Dashboard Scripts
   Shared by Admin & User dashboards
   ============================================ */
(function () {
  'use strict';

  var body = document.body;

  /* --- Sidebar toggle (mobile) --- */
  function initSidebar() {
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('dashSidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (!toggle || !sidebar || !overlay) return;

    function close() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      sidebar.classList.contains('open') ? close() : open();
    });
    overlay.addEventListener('click', close);
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 992) close();
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992) close();
    });
  }

  /* --- Dropdown panels (notifications / profile) --- */
  function initDropdowns() {
    var toggles = document.querySelectorAll('[data-dropdown-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = btn.closest('.dash-dropdown');
        var isOpen = parent.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) parent.classList.add('open');
      });
    });
    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllDropdowns();
    });
  }
  function closeAllDropdowns() {
    document.querySelectorAll('.dash-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }

  /* --- Animated counters --- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var duration = 1200;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(target * eased);
        el.textContent = prefix + value.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { io.observe(c); });
    } else {
      counters.forEach(animate);
    }
  }

  /* --- Table search filter --- */
  function initTableSearch() {
    document.querySelectorAll('[data-table-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        var tableId = input.getAttribute('data-table-search');
        var table = document.getElementById(tableId);
        if (!table) return;
        var q = input.value.trim().toLowerCase();
        var rows = table.querySelectorAll('tbody tr');
        var visible = 0;
        rows.forEach(function (row) {
          var match = row.textContent.toLowerCase().indexOf(q) !== -1;
          row.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        var empty = table.parentElement.querySelector('.table-empty-row');
        if (empty) empty.style.display = visible === 0 ? '' : 'none';
        window.dispatchEvent(new CustomEvent('table:filter'));
      });
    });

    document.querySelectorAll('[data-filter-col]').forEach(function (select) {
      select.addEventListener('change', function () {
        var tableId = select.getAttribute('data-table-search');
        var table = tableId ? document.getElementById(tableId) : null;
        if (!table) table = document.querySelector('.dash-table');
        if (!table) return;
        var col = parseInt(select.getAttribute('data-filter-col'), 10);
        var value = select.value.trim().toLowerCase();
        var q = (document.querySelector('[data-table-search="' + table.id + '"]') || { value: '' }).value.trim().toLowerCase();
        table.querySelectorAll('tbody tr').forEach(function (row) {
          var matchCell = value ? (row.cells[col] || {}).textContent.trim().toLowerCase() === value : true;
          var matchSearch = q ? row.textContent.toLowerCase().indexOf(q) !== -1 : true;
          row.style.display = (matchCell && matchSearch) ? '' : 'none';
        });
        window.dispatchEvent(new CustomEvent('table:filter'));
      });
    });
  }

  /* --- Simple pagination --- */
  function initPagination() {
    document.querySelectorAll('[data-pagination]').forEach(function (wrap) {
      var tableId = wrap.getAttribute('data-pagination');
      var table = document.getElementById(tableId);
      var info = wrap.querySelector('.info');
      var prev = wrap.querySelector('[data-page="prev"]');
      var next = wrap.querySelector('[data-page="next"]');
      var pages = wrap.querySelector('.pages');
      if (!table) return;

      var perPage = parseInt(wrap.getAttribute('data-per-page') || '5', 10);
      var current = 1;

      function getRows() {
        return Array.prototype.slice.call(table.querySelectorAll('tbody tr'))
          .filter(function (r) { return r.style.display !== 'none'; });
      }
      function render() {
        var rows = getRows();
        var total = rows.length;
        var totalPages = Math.max(1, Math.ceil(total / perPage));
        if (current > totalPages) current = totalPages;
        rows.forEach(function (r, i) {
          r.style.display = (i >= (current - 1) * perPage && i < current * perPage) ? '' : 'none';
        });
        if (info) {
          var from = total === 0 ? 0 : (current - 1) * perPage + 1;
          var to = Math.min(current * perPage, total);
          info.textContent = 'Showing ' + from + '\u2013' + to + ' of ' + total;
        }
        if (prev) prev.disabled = current <= 1;
        if (next) next.disabled = current >= totalPages;
        if (pages) {
          pages.innerHTML = '';
          for (var i = 1; i <= totalPages; i++) {
            (function (n) {
              var b = document.createElement('button');
              b.className = 'page-btn' + (n === current ? ' active' : '');
              b.textContent = n;
              b.setAttribute('aria-label', 'Page ' + n);
              b.addEventListener('click', function () { current = n; render(); });
              pages.appendChild(b);
            })(i);
          }
        }
      }
      if (prev) prev.addEventListener('click', function () { if (current > 1) { current--; render(); } });
      if (next) next.addEventListener('click', function () { current++; render(); });
      render();

      window.addEventListener('table:filter', function () {
        var rows = getRows();
        var totalPages = Math.max(1, Math.ceil(rows.length / perPage));
        if (current > totalPages) current = totalPages;
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* --- Session guard: dashboards require a stored role --- */
    try {
      if (!localStorage.getItem('stackly_role')) {
        window.location.replace('login.html');
        return;
      }
    } catch (e) { /* storage unavailable — allow access */ }

    initSidebar();
    initDropdowns();
    initCounters();
    initTableSearch();
    initPagination();
  });
})();
