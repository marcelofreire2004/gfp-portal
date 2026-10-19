/* ═══════════════════════════════════════════════════════════
   SHARED LAYOUT JS — FinMentor
   Sidebar injection, theme toggle, user management
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══ Config ═══
    const PAGES = [
        { section: 'Principal', items: [
            { href: '/inicio', label: 'Início', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' },
            { href: '/planejamento', label: 'Planejamento', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' },
            { href: '/lancamentos-page', label: 'Movimentações', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>' },
            { href: '/faturas-page', label: 'Compromissos Financeiros', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>' },
            { href: '/evolucao', label: 'Simulações', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' },
        ]},
        { section: 'Gestão', items: [
            { href: '/contas-page', label: 'Contas', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.2-8.6"/><path d="M21 3v6h-6"/></svg>' },
            { href: '/dividas-page', label: 'Dívidas', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>' },
            { href: '/metas-page', label: 'Metas', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
            { href: '/programas-page', label: 'Fidelidade', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
            { href: '/notificacoes-page', label: 'Notificações', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
        ]},
        { section: 'Configurações', items: [
            { href: '/admin', label: 'Cartões', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>', onclick: "localStorage.setItem('openCrud','cartoes')" },
            { href: '/admin', label: 'Categorias', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>', onclick: "localStorage.setItem('openCrud','categorias')" },
            { href: '/admin', label: 'Formas Pgto.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', onclick: "localStorage.setItem('openCrud','formas-pagamento')" },
            { href: '/admin', label: 'Apagar Dados', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>', onclick: "localStorage.setItem('openCrud','limpar')" },
        ]},
    ];

    // ═══ Detect active page ═══
    const path = window.location.pathname;

    // ═══ Don't inject on login page ═══
    if (path === '/login') return;

    // ═══ Check auth ═══
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // ═══ Fetch com autenticação ═══
    // Injeta Authorization: Bearer <token> automaticamente nas chamadas de API
    // same-origin e redireciona para /login quando o token é inválido/expirado
    // (401). Mantém chamadas a outros domínios e a rotas de auth intactas.
    (function instalarFetchAutenticado() {
        const originalFetch = window.fetch.bind(window);

        function mesmaOrigem(url) {
            try {
                // URLs relativas são sempre same-origin.
                const u = new URL(url, window.location.origin);
                return u.origin === window.location.origin;
            } catch {
                return false;
            }
        }

        function ehRotaDeAuthPublica(url) {
            try {
                const p = new URL(url, window.location.origin).pathname;
                return p === '/auth/login' || p === '/auth/register';
            } catch {
                return false;
            }
        }

        window.fetch = async function (input, init = {}) {
            const url = typeof input === 'string' ? input : (input && input.url) || '';

            // Só mexe em chamadas same-origin que não sejam login/registro.
            if (mesmaOrigem(url) && !ehRotaDeAuthPublica(url)) {
                const headers = new Headers(
                    (init && init.headers) ||
                    (typeof input !== 'string' && input && input.headers) ||
                    {}
                );
                if (!headers.has('Authorization')) {
                    const t = localStorage.getItem('token');
                    if (t) headers.set('Authorization', `Bearer ${t}`);
                }
                init = { ...init, headers };
            }

            const resposta = await originalFetch(input, init);

            // Token ausente/expirado/inválido → sessão encerrada.
            if (resposta.status === 401 && mesmaOrigem(url) && !ehRotaDeAuthPublica(url)) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/login';
            }
            return resposta;
        };
    })();

    // ═══ User info ═══
    const usr = JSON.parse(localStorage.getItem('usuario') || '{}');
    const nome = usr.nome || 'Usuário';
    const iniciais = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    // ═══ Theme ═══
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.documentElement.dataset.theme = savedTheme;

    // ═══ Page title ═══
    function getPageTitle() {
        const hora = new Date().getHours();
        const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
        if (path === '/' || path === '/inicio' || path === '/dashboard-page') return `${saudacao}, ${nome}`;
        if (path === '/planejamento') return 'Planejamento Financeiro';
        if (path === '/lancamentos-page') return 'Movimentações';
        if (path === '/evolucao' || path === '/simulacoes-page') return 'Simulações & Mentor';
        if (path === '/contas-page') return 'Contas';
        if (path === '/dividas-page') return 'Dívidas';
        if (path === '/metas-page') return 'Metas';
        if (path === '/programas-page') return 'Programas de Fidelidade';
        if (path === '/faturas-page') return 'Compromissos Financeiros';
        if (path === '/notificacoes-page') return 'Notificações';
        if (path === '/admin') return 'Configurações';
        return 'FinMentor';
    }

    // ═══ Build sidebar HTML ═══
    function buildSidebarHTML() {
        let html = '<div class="sidebar-logo"><span>🧠</span> FinMentor</div>';
        html += '<div class="sidebar-nav">';
        PAGES.forEach(group => {
            html += `<div class="sidebar-section">${group.section}</div>`;
            group.items.forEach(item => {
                const isActive = (path === item.href) ||
                    (item.href === '/inicio' && (path === '/' || path === '/inicio' || path === '/dashboard-page')) ||
                    (item.href === '/admin' && path === '/admin' && item.onclick && item.onclick.includes(localStorage.getItem('openCrud') || 'cartoes'));
                const activeClass = isActive ? ' active' : '';
                const onclickAttr = item.onclick ? ` onclick="${item.onclick}"` : '';
                html += `<a href="${item.href}" class="sidebar-item${activeClass}"${onclickAttr}>${item.icon}${item.label}</a>`;
            });
        });
        html += '</div>';
        html += `<div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="sidebar-avatar">${iniciais}</div>
                <div>
                    <div class="sidebar-username">${nome}</div>
                    <div class="sidebar-role">Mentor Financeiro</div>
                </div>
                <button class="sidebar-logout" onclick="if(confirm('Sair da conta?')){localStorage.removeItem('token');localStorage.removeItem('usuario');location.href='/login'}" title="Sair">⏻</button>
            </div>
        </div>`;
        return html;
    }

    // ═══ Inject layout using DOM manipulation ═══
    function injectLayout() {
        const body = document.body;

        // Collect all existing children (nodes) from body
        const fragment = document.createDocumentFragment();
        while (body.firstChild) {
            fragment.appendChild(body.firstChild);
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = function() { window.toggleSidebar(); };

        // Create sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = buildSidebarHTML();

        // Create app-main wrapper
        const appMain = document.createElement('div');
        appMain.className = 'app-main';

        // Create topbar
        const topbar = document.createElement('div');
        topbar.className = 'topbar';
        topbar.innerHTML = `
            <div class="topbar-left">
                <button class="mobile-toggle" onclick="toggleSidebar()">☰</button>
                <div>
                    <div class="topbar-title">${getPageTitle()}</div>
                </div>
            </div>
            <div class="topbar-right" id="topbar-right">
                <button class="topbar-btn" onclick="toggleTheme()" title="Alternar tema">🌓</button>
            </div>
        `;

        // Create page-content
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.appendChild(fragment);

        // Assemble
        appMain.appendChild(topbar);
        appMain.appendChild(pageContent);

        body.appendChild(overlay);
        body.appendChild(sidebar);
        body.appendChild(appMain);
    }

    // ═══ Global functions ═══
    window.toggleTheme = function () {
        const current = document.documentElement.dataset.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
    };

    window.toggleSidebar = function () {
        document.querySelector('.sidebar').classList.toggle('open');
        document.querySelector('.sidebar-overlay').classList.toggle('open');
    };

    // ═══ Execute ═══
    function run() {
        injectLayout();
        document.body.classList.add('layout-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

})();
