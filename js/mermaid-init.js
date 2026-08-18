/* ============================================================
   AI Академія — ініціалізація Mermaid у фірмовій темній темі.
   Підключати ПІСЛЯ бібліотеки mermaid (CDN), наприкінці <body>:
     <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
     <script src="../js/mermaid-init.js"></script>
   Діаграми пишуться прямо в HTML: <pre class="mermaid">flowchart TD ...</pre>
   ============================================================ */
(function () {
  "use strict";

  if (typeof mermaid === "undefined") {
    console.warn("[AIA] Бібліотека Mermaid не завантажилась — діаграми не відрендеряться.");
    return;
  }

  mermaid.initialize({
    startOnLoad: true,
    securityLevel: "strict",
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    theme: "base",
    themeVariables: {
      background: "#1B1916",
      primaryColor: "#272320",        // заливка вузлів
      primaryTextColor: "#F0EEE6",    // текст у вузлах
      primaryBorderColor: "#57504A",  // межі вузлів
      lineColor: "#A8A095",           // стрілки
      secondaryColor: "#1E1B18",
      tertiaryColor: "#141312",
      textColor: "#CFC9BF",
      fontSize: "15px",
      clusterBkg: "#171513",          // фон підграфів (subgraph)
      clusterBorder: "#3A342E",
      edgeLabelBackground: "#1B1916", // підкладка під підписи стрілок
      titleColor: "#E8DCC3",
      nodeTextColor: "#F0EEE6"
    },
    flowchart: {
      curve: "basis",
      padding: 12
    }
  });
})();
