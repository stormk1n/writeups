const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const yauzl = require('yauzl')
const module = require('module');
const crypto = require('crypto')
const process = require('process')

// Set the flag
process.env['FLAG'] = flag;

process.chdir('/tmp')

fs.mkdirSync('app/plugins', { recursive: true })
fs.mkdirSync('app/plugins/archive', { recursive: true })
fs.mkdirSync('app/views', { recursive: true })

// Add plugins
// Plugin template with metadata (no icon)
const createPlugin = (name, desc, category, code, icon) => `
class Plugin {
  constructor(name, desc, category, code, icon) {
    this.name = name;
    this.desc = desc;
    this.category = category;
    this.code = code;
    this.icon = icon;
  }
  run() {
    eval(this.code);
  }
  getName() {
    return this.name
  }
  get() {
    return {
      name: this.name,
      desc: this.desc,
      category: this.category,
      icon: this.icon,
      code: this.code,
    };
  }
}

const plugin = new Plugin(
  ${JSON.stringify(name)},
  ${JSON.stringify(desc)},
  ${JSON.stringify(category)},
  ${JSON.stringify(code)},
  ${JSON.stringify(icon)}
);

module.exports = plugin;
`.trim();



// web design
fs.writeFileSync('app/views/index.ejs', `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plugin Marketplace</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Averia+Sans+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Changa:wght@200..800&family=Coiny&family=Comic+Relief:wght@400;700&family=Finger+Paint&family=Jersey+15&family=Knewave&family=Nosifer&family=Schoolbell&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap");
      body {
        font-family: "Averia Sans Libre", sans-serif;
        font-weight: 700;
        font-style: normal;
        background: linear-gradient(135deg, #151515 0%, #1d1d1d 100%);
      }

      /* Animated Background Canvas */
      #dotCanvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
      }

      .content-wrapper {
        position: relative;
        z-index: 1;
      }

      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
      .sidebar {
        transition: transform 0.3s ease;
      }
      .sidebar.hidden-mobile {
        transform: translateX(-100%);
      }
      @media (min-width: 768px) {
        .sidebar.hidden-mobile {
          transform: translateX(0);
        }
      }
      /* Custom scrollbar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
      }
    </style>
  </head>
  <body class="min-h-screen text-white overflow-x-hidden">
    <!-- Animated Dot Background -->
    <canvas id="dotCanvas"></canvas>

    <!-- Main Content -->
    <div
      class="content-wrapper max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >

      <!-- message toast -->
      <% if (message != "") { %>
      <div class="flex items-center justify-center mb-4 sm:mb-6">
        <div class="flex items-center justify-center border-1 border-red-400 bg-red-500 px-4 h-[50px] text-white rounded-xl text-sm">
          <p><%= message %></p>
        </div>
      </div>
      <% } %>
      
      <!-- Header -->
      <div class="flex items-center mb-4 sm:mb-6">
        <span class="text-2xl sm:text-3xl lg:text-4xl font-bold"> M </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 16 16"
        >
          <path
            fill="#ffffff"
            fill-rule="evenodd"
            d="M1 8a7 7 0 1 1 2.898 5.673c-.167-.121-.216-.406-.002-.62l1.8-1.8a3.5 3.5 0 0 0 4.572-.328l1.414-1.415a.5.5 0 0 0 0-.707l-.707-.707l1.559-1.563a.5.5 0 1 0-.708-.706l-1.559 1.562l-1.414-1.414l1.56-1.562a.5.5 0 1 0-.707-.706l-1.56 1.56l-.707-.706a.5.5 0 0 0-.707 0L5.318 5.975a3.5 3.5 0 0 0-.328 4.571l-1.8 1.8c-.58.58-.62 1.6.121 2.137A8 8 0 1 0 0 8a.5.5 0 0 0 1 0"
          />
        </svg>
        <span class="text-2xl sm:text-3xl lg:text-4xl font-bold">
          ximise flexibility
        </span>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div class="flex-1 relative">
          <input
            type="text"
            id="searchInput"
            placeholder="Search plugins..."
            class="rounded-xl border-2 border-white/3 w-full bg-gray-800/10 backdrop-blur-sm rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <!-- Mobile: Show only menu button -->
        <button
          id="filterToggle"
          class="md:hidden px-4 py-2.5 bg-gray-700/20 rounded-lg hover:bg-gray-700 transition text-sm flex items-center gap-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
          Categories
        </button>

        <!-- Desktop: Show all filter buttons -->
        <div class="hidden md:flex gap-2 flex-wrap">
          <button
            class="rounded-xl border-2 border-white/3 px-3 py-2 bg-gray-700/40 rounded-lg hover:bg-gray-800 transition text-sm whitespace-nowrap"
          >
            Official
          </button>
          <button
            class="rounded-xl border-2 border-white/3 px-3 py-2 bg-gray-700/40 rounded-lg hover:bg-gray-800 transition text-sm whitespace-nowrap"
          >
            Verified
          </button>
          <button
            class="rounded-xl border-2 border-white/3 px-3 py-2 bg-gray-700/40 rounded-lg hover:bg-gray-800 transition text-sm whitespace-nowrap"
          >
            Unverified
          </button>
        </div>
      </div>

      <div class="flex gap-4 lg:gap-6 relative">
        <!-- Sidebar Overlay for Mobile -->
        <div
          id="sidebarOverlay"
          class="fixed inset-0 bg-black/20 z-40 md:hidden hidden"
        ></div>

        <!-- Sidebar Categories -->
        <div
          id="sidebar"
          class="rounded-2xl border-2 border-white/3 sidebar fixed md:sticky top-0 left-0 w-64 md:w-56 lg:w-64 flex-shrink-0 h-screen md:h-auto z-50 md:z-0"
        >
          <div
            class="bg-gray-800/10 backdrop-blur-sm rounded-lg p-4 h-full overflow-y-auto custom-scrollbar"
          >
            <!-- Close button for mobile -->
            <div class="flex justify-between items-center mb-4 md:hidden">
              <h2 class="text-lg font-semibold">Categories</h2>
              <button id="closeSidebar" class="text-gray-400 hover:text-white">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <h2 class="text-lg font-semibold mb-3 hidden md:block">
              Categories
            </h2>

            <div class="space-y-1">
              <label
                class="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-700/30 rounded px-2 text-sm"
              >
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked
                  class="w-3.5 h-3.5"
                />
                <span>All categories</span>
              </label>
              <label
                class="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-700/30 rounded px-2 text-sm"
              >
                <input
                  type="radio"
                  name="category"
                  value="cybersecurity"
                  class="w-3.5 h-3.5"
                />
                <span>Security</span>
              </label>
              <label
                class="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-700/30 rounded px-2 text-sm"
              >
                <input
                  type="radio"
                  name="category"
                  value="data-storage"
                  class="w-3.5 h-3.5"
                />
                <span>Data & Storage</span>
              </label>
              <label
                class="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-700/30 rounded px-2 text-sm"
              >
                <input
                  type="radio"
                  name="category"
                  value="developer-tools"
                  class="w-3.5 h-3.5"
                />
                <span>Development</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"
          >
            <h2 class="text-lg sm:text-xl font-semibold">
              <span id="pluginCount">6</span> Total plugins
            </h2>
          </div>

          <!-- Plugin Grid - Optimized for 842x565 -->
          <div
            id="pluginGrid"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            <!-- Plugins will be rendered here -->
          </div>
        </div>
      </div>
    </div>

    <script>
      const plugins = <%- JSON.stringify(plugins.map(p => p.get())) %>;
      const canvas = document.getElementById("dotCanvas");
      const ctx = canvas.getContext("2d");

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const mouse = { x: width / 2, y: height / 2 };
      const dots = [];
      const dotSpacing = 20;
      const maxDistance = 90;

      // Create dot grid
      function createDots() {
        dots.length = 0;
        const cols = Math.ceil(width / dotSpacing);
        const rows = Math.ceil(height / dotSpacing);

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            dots.push({
              x: i * dotSpacing,
              y: j * dotSpacing,
              baseSize: 1,
              size: 1,
              opacity: 0.3,
            });
          }
        }
      }

      // Draw dots with cursor interaction
      function draw() {
        ctx.clearRect(0, 0, width, height);

        dots.forEach((dot) => {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate size and opacity based on distance to cursor
          if (distance < maxDistance) {
            const strength = 1 - distance / maxDistance;
            dot.size = dot.baseSize + strength * 5; // Max 10px when closest
            dot.opacity = 0.2 + strength * 0.4; // Max 1.0 opacity

            // Bright green/yellow for closest dots
            const hue = 20 - strength * 100; // 120 (green) to 60 (yellow)
            ctx.fillStyle = \`hsla(\${hue}, 100%, 50%, \${dot.opacity})\`;
          } else {
            // Default small white dots
            dot.size = dot.baseSize;
            dot.opacity = 0.2;
            ctx.fillStyle = \`rgba(255, 255, 255, \${dot.opacity})\`;
          }

          // Draw the dot
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        });

        requestAnimationFrame(draw);
      }

      // Track mouse movement
      document.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });

      // Handle window resize
      window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createDots();
      });

      // Initialize
      createDots();
      draw();

      function renderPlugins(filteredPlugins = plugins) {
        const grid = document.getElementById("pluginGrid");
        grid.innerHTML = filteredPlugins
          .map(
            (plugin) => \`
                <div class="card-hover bg-gray-800/10 backdrop-blur-sm rounded-2xl border-2 border-white/3 p-4 cursor-pointer">
                    <div class="flex flex-col items-center text-center">
                        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-2xl sm:text-3xl mb-3">
                            \${plugin.icon}
                        </div>
                        <h3 class="text-base sm:text-lg font-semibold mb-1.5"\>\${plugin.name}</h3>
                        <p class="text-gray-400 text-xs sm:text-sm line-clamp-2">\${plugin.description}</p>
                    </div>
                </div>
            \`
          )
          .join("");

        document.getElementById("pluginCount").textContent =
          filteredPlugins.length;
      }

      // Mobile sidebar toggle
      const sidebar = document.getElementById("sidebar");
      const sidebarOverlay = document.getElementById("sidebarOverlay");
      const filterToggle = document.getElementById("filterToggle");
      const closeSidebar = document.getElementById("closeSidebar");

      function openSidebar() {
        sidebar.classList.remove("hidden-mobile");
        sidebarOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }

      function closeSidebarFunc() {
        sidebar.classList.add("hidden-mobile");
        sidebarOverlay.classList.add("hidden");
        document.body.style.overflow = "";
      }

      filterToggle?.addEventListener("click", openSidebar);
      closeSidebar?.addEventListener("click", closeSidebarFunc);
      sidebarOverlay?.addEventListener("click", closeSidebarFunc);

      // Hide sidebar initially on mobile
      if (window.innerWidth < 768) {
        sidebar.classList.add("hidden-mobile");
      }

      // Search functionality
      document.getElementById("searchInput").addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = plugins.filter((plugin) => {
          const name = (plugin.name || "Undefined").toLowerCase();
          const description = (
            plugin.description || "No description provided."
          ).toLowerCase();

          return (
            name.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase())
          );
        });

        renderPlugins(filtered);
      });

      // Category filtering
      document.querySelectorAll('input[name="category"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const category = e.target.value;
          if (category === "all") {
            renderPlugins(plugins);
          } else {
            const filtered = plugins.filter(
              (plugin) => plugin.category === category
            );
            renderPlugins(filtered);
          }
          // Close sidebar on mobile after selection
          if (window.innerWidth < 768) {
            closeSidebarFunc();
          }
        });
      });

      // Initial render
      renderPlugins();
    </script>
  </body>
</html>
`.trim())


// Add plugins with metadata
fs.writeFileSync("app/plugins/gitlab.js", createPlugin(
    "Gitlab",
    "Intigrate Gitlab support to your Node.js app.",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 247"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path fill="#E24329" d="m251.845 97.642l-.328-.986l-34.85-90.903c-.657-1.808-1.972-3.287-3.616-4.274Q210.586 0 207.627 0c-1.973 0-3.78.822-5.26 1.973a8.73 8.73 0 0 0-3.124 4.767l-23.506 71.999H80.56l-23.506-72c-.493-1.808-1.644-3.451-3.123-4.766C52.45.822 50.643 0 48.67 0s-3.781.329-5.425 1.48c-1.644.986-2.96 2.465-3.617 4.273L4.781 96.656l-.33.986c-10.355 26.959-1.479 57.37 21.535 74.794h.328c0 .164 53.096 39.944 53.096 39.944l26.3 19.89l15.946 12c3.78 2.96 9.205 2.96 12.986 0l15.945-12l26.3-19.89l53.424-39.944c23.014-17.425 31.726-47.835 21.37-74.794z"/><path fill="#FC6D26" d="m251.845 97.642l-.328-.986c-17.26 3.616-33.205 10.85-46.849 21.04c-.164 0-41.424 31.398-76.602 57.863a18377 18377 0 0 0 48.657 36.821l53.424-39.944c23.013-17.425 31.726-47.835 21.37-74.794z"/><path fill="#FCA326" d="m79.245 212.38l26.301 19.89l15.945 12c3.78 2.96 9.206 2.96 12.986 0l15.945-12l26.301-19.89s-22.684-17.095-48.657-36.82c-26.136 19.725-48.82 36.82-48.82 36.82"/><path fill="#FC6D26" d="M51.465 117.697c-13.644-10.192-29.589-17.589-46.849-21.04l-.329.985c-10.356 26.959-1.479 57.37 21.534 74.794h.33c0 .164 53.094 39.944 53.094 39.944s22.685-17.095 48.821-36.82c-35.013-26.466-76.272-57.699-76.601-57.863"/></svg>`,
));

fs.writeFileSync("app/plugins/gonode.js", createPlugin(
    "GoNode",
    "Run Go code inside Node.js",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 348"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path fill="#F6D2A2" d="M3.686 188.165c.498 10.26 10.758 5.479 15.34 2.291c4.383-3.088 5.678-.498 6.076-6.475c.299-3.984.697-7.869.498-11.853c-6.674-.598-13.846.996-19.325 4.98c-2.888 1.992-8.068 8.567-2.59 11.057m204.502 126.107c7.869 4.881 22.313 19.624 10.459 26.796c-11.356 10.36-17.73-11.456-27.692-14.444c4.283-5.877 9.662-11.256 17.233-12.352m-140.85 16.635c-9.264 1.395-14.444 9.762-22.213 14.046c-7.272 4.283-10.061-1.395-10.659-2.59c-1.095-.498-.996.498-2.789-1.295c-6.773-10.659 6.973-18.428 14.145-23.708c9.961-1.992 16.237 6.674 21.516 13.547M251.916 186.87c-.498 10.26-10.758 5.479-15.34 2.291c-4.383-3.088-5.678-.498-6.076-6.475c-.3-3.984-.698-7.869-.498-11.853c6.673-.598 13.845.996 19.324 4.98c2.79 1.992 8.069 8.567 2.59 11.057"/><path fill="#69D7E2" d="M224.722 61.759c35.561-12.551 7.77-61.26-23.21-39.745c-20.32-17.432-48.31-20.62-77.696-20.62C95.03 3.687 67.636 8.966 48.511 25.7C17.63 5.777-10.858 53.59 25.4 65.644c-10.16 39.445 1.394 79.688-.2 119.831c-1.494 36.06-10.957 84.37 9.065 116.744c17.034 27.692 53.69 37.554 83.873 38.65c38.549 1.394 85.266-8.069 103.993-45.423c17.93-35.561 12.95-79.888 10.659-118.238c-2.291-38.749 1.992-78.095-8.069-115.45"/><path d="M254.605 180.794c-.996-2.092-2.888-4.483-4.681-5.778c-4.582-3.287-10.46-5.08-16.536-5.279c-.199-6.176-.398-12.95-.398-21.516v-7.77c-.1-24.504-.399-35.262-1.793-48.71c-1.096-10.558-2.79-20.32-5.18-29.484c8.069-3.088 13.348-8.168 15.44-14.743c1.992-6.076.996-12.949-2.39-19.025c-3.487-5.977-9.065-10.46-15.54-12.252c-6.973-1.893-14.543-.498-21.815 4.382c-6.475-5.478-13.945-9.662-22.313-12.85C164.557 2.292 147.325.2 123.916.2v.996l-.1-.996c-25.002 1.992-43.53 5.877-58.87 13.348c-6.176 2.988-11.654 6.574-16.435 10.758c-7.372-4.582-15.042-5.678-22.114-3.486c-6.574 1.992-12.252 6.674-15.639 12.75c-3.387 6.076-4.184 13.049-1.893 19.026c2.291 5.976 7.57 10.658 15.44 13.547c-2.49 10.06-3.785 20.719-3.984 32.473c-.2 11.455.298 20.62 2.091 41.338c1.295 15.44 1.793 22.512 1.993 31.079c-6.774-.299-13.547 1.494-18.628 5.18c-1.793 1.295-3.785 3.586-4.681 5.777c-1.295 2.79-.797 5.28 1.793 6.774c.398 4.781 3.088 6.972 7.172 6.574c2.988-.299 6.574-1.893 9.662-4.084a11.208 11.208 0 0 1 2.092-1.195c.299-.1.498-.2.797-.3c0 0 .597-.198.797-.298c.298-.1.597-.2.796-.399c-.199 4.682-.597 9.563-1.494 20.72c-.996 12.55-1.494 19.424-1.693 27.094c-.897 28.488 2.49 49.207 12.65 65.643c3.188 5.18 7.073 9.762 11.655 13.946c-.897.597-4.682 3.387-5.877 4.283c-4.184 3.188-7.072 5.877-8.766 8.865c-2.191 3.885-2.191 7.77.299 11.854l.1.1l.1.1c1.095 1.095 1.693 1.394 2.49 1.394h.297c.1.2.2.299.3.498c.298.498.597.896.896 1.295c2.49 2.889 5.976 3.586 10.658.797c2.49-1.295 4.283-2.79 8.068-5.977l.2-.2c6.076-5.179 9.064-7.071 13.547-7.769l1.594-.299c.597.3 1.195.499 1.892.797c14.145 5.678 30.58 8.766 47.216 9.364c21.516.797 42.235-1.893 59.766-8.268c4.682-1.693 9.065-3.686 13.249-5.877c2.59.996 4.78 3.088 8.965 7.969c.199.2.199.2.298.398c.2.2.2.3.3.399c.198.299.497.498.696.797c3.288 3.884 5.48 5.777 7.97 6.873c3.286 1.394 6.474.697 9.761-2.291c5.778-3.586 6.176-9.164 2.39-15.54c-2.689-4.482-7.37-9.164-11.753-12.152c5.18-5.08 9.662-11.156 13.148-18.03c9.563-19.125 13.249-41.438 13.05-70.126c-.1-10.16-.499-19.025-1.594-35.96v-.497c.498.199.996.498 1.494.896c3.088 2.092 6.674 3.785 9.662 4.084c4.084.399 6.774-1.793 7.172-6.574c2.49-1.594 2.988-4.084 1.693-6.873M222.93 18.328c5.977 1.594 11.157 5.778 14.344 11.356c3.188 5.578 4.084 11.854 2.291 17.432c-1.892 5.877-6.674 10.559-14.145 13.348a162.04 162.04 0 0 0-5.279-15.739c2.889-2.49 4.283-5.578 1.992-9.96c-2.29-4.384-6.275-4.882-10.36-3.587c-2.59-3.387-5.478-6.375-8.466-9.164c6.574-4.184 13.348-5.379 19.623-3.686M10.56 51.997c-2.092-5.38-1.395-11.754 1.793-17.332c3.187-5.579 8.367-9.961 14.543-11.754c6.375-1.893 13.248-.997 20.022 2.988a65.541 65.541 0 0 0-10.36 11.854c-5.18-2.69-10.459-3.188-13.447 2.29c-3.088 5.878.498 9.563 5.578 12.352c-.697 1.694-1.395 3.487-1.992 5.28c-.698 2.191-1.395 4.482-1.992 6.773c-7.272-2.789-12.053-7.072-14.145-12.451m12.053 135.77c-.1 0-.698.199-.698.298c-.298.1-.597.2-.896.399c-.797.299-1.594.797-2.39 1.394c-2.79 1.993-6.177 3.487-8.767 3.686c-2.988.299-4.681-.996-4.98-4.582c2.092-.697 2.988-1.195 3.785-2.39l-1.594-1.196c-.597.797-1.195 1.096-2.988 1.693c-.1 0-.1 0-.2.1c-1.593-.897-1.892-2.291-.995-4.283c.797-1.793 2.59-3.885 4.084-4.98c4.781-3.487 11.156-5.18 17.531-4.782c0 2.49.1 4.98 0 7.37c0 .3 0 .499-.1.798c-.099 1.394-.099 1.992-.199 2.69c-.298 2.888-.498 3.286-1.593 3.785m30.082 150.312l-.2.2c-3.685 3.187-5.478 4.482-7.769 5.777c-3.785 2.291-6.375 1.793-8.168-.398c-.299-.3-.498-.698-.697-.997c-.1-.1-.2-.298-.299-.398v-.1c.2-1.793.897-3.088 2.69-5.877c.1-.1.1-.1.1-.199c1.095-1.594 1.593-2.49 2.091-3.586l-1.793-.797c-.398.897-.896 1.694-1.893 3.287c-.1.1-.1.1-.1.2c-1.792 2.59-2.59 4.183-2.988 5.976h-.398c-.2-.1-.498-.299-.896-.697c-3.885-6.176-.797-11.455 7.968-18.03c1.096-.796 4.782-3.386 5.778-4.183c.2 0 .398-.1.598-.2c5.378 4.583 11.654 8.567 18.627 11.854c0 .1.1.2.199.3c-4.084.995-7.272 3.087-12.85 7.868m167.247-10.857c3.088 5.18 2.988 9.363-.897 12.252c-.298-.598-.498-1.295-.896-2.291c0-.1 0-.1-.1-.2c-1.394-3.785-2.29-5.378-3.984-7.171l-1.395 1.394c1.494 1.395 2.192 2.889 3.586 6.375c0 .1 0 .1.1.2c.498 1.294.797 2.091 1.096 2.789c-2.59 2.191-4.881 2.59-7.272 1.494c-2.092-.897-4.084-2.79-7.272-6.375c-.199-.2-.398-.498-.597-.797c-.1-.1-.2-.2-.3-.399c-.198-.199-.198-.199-.298-.398c-3.686-4.283-5.877-6.574-8.268-7.87c5.579-3.187 10.56-6.773 15.042-10.957c4.183 3.088 8.865 7.67 11.455 11.954m1.394-32.274c-8.566 17.233-23.707 29.385-44.028 36.756c-17.332 6.276-37.852 8.866-59.069 8.069c-36.557-1.295-68.233-14.045-83.075-38.151c-9.961-16.038-13.249-36.458-12.352-64.548c.299-7.67.697-14.543 1.693-27.094c1.096-14.145 1.395-18.229 1.694-24.604c.199-4.582.199-9.264.1-14.244c-.2-8.766-.698-15.739-1.993-31.378c-1.793-20.719-2.291-29.784-2.092-41.14c.3-14.94 2.291-28.09 6.475-40.54c6.771-20.223 19.224-33.87 37.154-42.734c15.041-7.37 33.27-11.156 58.073-13.149c23.21 0 40.143 2.092 54.786 7.471c17.531 6.475 30.58 17.83 39.545 35.263c5.778 14.144 9.165 29.385 10.958 46.916c1.394 13.348 1.693 24.106 1.793 48.51v7.77c.1 12.053.298 20.52.797 28.987c.199 3.287.298 4.682.796 12.551c1.096 16.934 1.495 25.7 1.594 35.86c.2 28.588-3.387 50.602-12.85 69.429m30.481-109.074c-.1 0-.199-.1-.298-.1c-1.793-.597-2.391-.996-2.989-1.693l-1.594 1.195c.897 1.196 1.793 1.694 3.786 2.39c-.399 3.587-2.092 4.882-4.98 4.583c-2.59-.2-5.978-1.793-8.767-3.686c-.797-.597-1.593-.996-2.39-1.394c-.1 0-.2-.1-.3-.1c-.398-5.478-.398-6.873-.597-9.762l-.299-5.379c5.579.1 11.057 1.793 15.24 4.881c1.495 1.096 3.288 3.188 4.085 4.98c.996 1.694.797 3.188-.897 4.085"/><path fill="#FFF" d="M138.918 104.123c.1 5.08 1.096 10.658.2 16.037c-1.395 2.59-3.985 2.89-6.276 3.885c-3.188-.498-5.877-2.59-7.172-5.578c-.797-6.076.199-11.854.498-17.93c0-.2 3.785.1 7.172 1.096c2.888.896 5.578 2.39 5.578 2.49m-28.19.398c-2.79 10.56 3.686 27.792 14.344 13.647c-.797-5.977.1-11.754.398-17.631c.1-.498-14.642 3.287-14.742 3.984"/><path d="M140.113 108.805c-.199-2.989-.299-4.184-.299-5.678v-.697l-.697-.2l-12.55-3.884v-.698l-1.296.3h-.1v.099l-14.144 3.586l-.498.1l-.2.497c-2.19 5.28-1.693 13.249 1.096 18.13c3.188 5.578 8.368 5.677 13.647-.698a10.192 10.192 0 0 0 7.47 5.38h.3l.298-.1c.399-.2.797-.3 1.495-.598c.1 0 .1 0 .199-.1c2.889-.996 4.084-1.793 5.08-3.685l.1-.1v-.2c.298-1.792.398-3.685.398-5.776c0-1.495-.1-2.89-.299-5.678m-15.938-3.686c-.1 1.793-.199 2.49-.298 3.486c-.2 3.686-.2 6.475.1 9.264c-4.682 5.977-8.368 5.977-10.858 1.494c-2.391-4.183-2.89-11.256-1.096-15.937l12.55-3.188c-.099 1.295-.198 2.59-.398 4.881m13.946 14.743c-.697 1.195-1.594 1.793-3.984 2.59c-.1 0-.1 0-.2.099c-.597.2-.996.398-1.295.498c-2.69-.498-4.98-2.291-6.076-4.781c-.299-2.69-.299-5.479-.1-9.164c.1-.997.1-1.694.3-3.487c.199-2.29.298-3.685.298-4.98l10.858 3.287c0 1.295.1 2.49.299 5.08c.199 2.69.298 4.084.298 5.678c0 1.892-.1 3.586-.398 5.18"/><g transform="translate(48.476 21.976)"><path fill="#FFF" d="M2.291 38.749c9.164 35.66 66.241 26.496 64.05-9.264C63.75-13.348-6.475-5.08 2.29 38.749"/><path d="M67.337 29.385c-.598-10.36-5.18-18.428-12.75-23.508C47.813 1.295 38.848-.498 29.983.597C21.118 1.794 12.949 5.778 7.57 12.054C1.594 19.026-.697 28.19 1.395 38.749l.896-.2l-.896.2c9.363 36.656 68.133 27.791 65.942-9.364M3.187 38.55c-1.992-10.06.2-18.627 5.778-25.102c5.08-5.877 12.75-9.761 21.217-10.857c8.467-1.096 16.934.598 23.31 4.98c7.071 4.782 11.355 12.253 11.952 22.114c2.092 34.764-53.391 43.132-62.256 8.865"/><ellipse cx="18.03" cy="32.872" rx="9.662" ry="10.459"/><ellipse cx="22.412" cy="35.262" fill="#FFF" rx="2.291" ry="2.689"/></g><g transform="translate(129.618 18.098)"><path fill="#FFF" d="M1.195 35.96C8.268 76.9 75.206 66.042 65.544 24.803C56.878-12.252-1.196-1.992 1.195 35.96"/><path d="M66.44 24.604C57.575-13.547-2.19-3.088.2 36.059v.1c3.286 19.324 20.52 29.186 39.545 25.998C48.41 60.663 56.18 56.48 61.26 50.304c5.578-6.874 7.57-15.739 5.18-25.7m-6.673 24.504c-4.782 5.778-12.053 9.762-20.321 11.157c-18.03 2.988-34.167-6.276-37.354-24.405C-.1-.996 56.28-10.858 64.647 25.002c2.192 9.463.399 17.731-4.88 24.106"/><ellipse cx="17.631" cy="34.167" rx="9.463" ry="10.459"/><ellipse cx="22.014" cy="36.557" fill="#FFF" rx="2.191" ry="2.689"/></g><path fill="#F6D2A2" d="M112.784 83.002c-7.869.697-14.244 9.961-10.16 17.332c5.379 9.762 17.432-.896 24.903.1c8.666.2 15.738 9.164 22.611 1.594c7.67-8.368-3.287-16.536-11.953-20.122z"/><path fill="#231F20" d="M151.134 89.676c-2.69-3.387-7.37-6.475-12.45-8.567l-.2-.1h-.2l-25.5.997c-8.865.797-15.24 11.057-10.957 18.826c1.693 2.989 3.984 4.483 7.072 4.682c2.291.1 4.682-.398 8.368-1.693c.299-.1.697-.2 1.195-.399c4.98-1.693 6.973-2.191 8.965-1.892h.1c2.39 0 4.383.697 8.168 2.191c4.183 1.693 5.478 2.191 7.57 2.39c2.889.2 5.38-.796 7.67-3.286c3.885-4.284 3.686-8.866.2-13.15m-1.693 11.754c-1.893 2.092-3.785 2.79-6.076 2.69c-1.793-.1-2.989-.598-6.973-2.192c-3.984-1.693-6.176-2.291-8.766-2.39c-2.49-.3-4.582.199-9.861 1.992c-.498.199-.897.298-1.196.398c-7.271 2.49-10.758 2.291-13.148-2.092c-3.586-6.474 1.892-15.24 9.363-15.938l25.202-.996c4.781 1.993 9.064 4.881 11.555 7.97c2.988 3.585 3.088 7.171-.1 10.558"/><path d="M140.177 78.719c-3.088-11.356-28.987-9.663-28.39 3.885c1.296 10.06 31.378 7.37 28.39-3.885"/></svg>`,
));

fs.writeFileSync("app/plugins/raspapi.js", createPlugin(
    "RaspAPi",
    "API for Raspberry pi",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 327"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path d="M69.298.005c-1.653.051-3.433.662-5.453 2.255C58.9.353 54.102-.31 49.813 3.573c-6.623-.859-8.775.914-10.406 2.984c-1.454-.03-10.879-1.495-15.202 4.953C13.343 10.225 9.91 17.899 13.8 25.056c-2.219 3.434-4.518 6.827.67 13.375c-1.835 3.646-.697 7.602 3.626 12.389c-1.14 5.127 1.102 8.743 5.125 11.562c-.753 7.015 6.433 11.094 8.578 12.547c.824 4.087 2.541 7.945 10.748 10.077c1.354 6.092 6.286 7.144 11.063 8.422c-15.787 9.177-29.325 21.25-29.233 50.875l-2.313 4.125c-18.102 11.008-34.388 46.39-8.92 75.148c1.663 9.002 4.453 15.468 6.937 22.624c3.715 28.836 27.962 42.339 34.358 43.936c9.371 7.138 19.352 13.911 32.86 18.656c12.731 13.131 26.525 18.136 40.394 18.128c.204 0 28.277-4.996 41.01-18.128c13.506-4.745 23.487-11.518 32.86-18.656c6.394-1.597 30.641-15.1 34.356-43.936c2.484-7.156 5.274-13.622 6.938-22.624c25.466-28.761 9.181-64.144-8.92-75.152l-2.317-4.125c.092-29.622-13.446-41.696-29.233-50.875c4.776-1.278 9.71-2.33 11.062-8.422c8.207-2.133 9.925-5.99 10.748-10.077c2.146-1.453 9.331-5.532 8.58-12.547c4.021-2.819 6.264-6.436 5.123-11.562c4.324-4.787 5.461-8.743 3.626-12.39c5.19-6.544 2.887-9.937.671-13.371c3.888-7.157.457-14.832-10.409-13.546c-4.32-6.448-13.744-4.984-15.202-4.954c-1.63-2.069-3.782-3.842-10.405-2.983c-4.289-3.883-9.085-3.221-14.032-1.313c-5.874-4.635-9.76-.92-14.2.485c-7.112-2.324-8.739.859-12.233 2.156c-7.756-1.639-10.113 1.929-13.83 5.695l-4.326-.086c-11.698 6.894-17.51 20.932-19.57 28.149c-2.06-7.218-7.859-21.256-19.555-28.149l-4.325.086c-3.723-3.766-6.079-7.334-13.835-5.695C86.78 3.603 85.16.42 78.042 2.744c-2.914-.922-5.594-2.838-8.749-2.74L-11 141"/><path fill="#75A928" d="M46.008 30.334c31.036 16.001 49.079 28.945 58.964 39.969c-5.062 20.289-31.47 21.215-41.126 20.646c1.977-.92 3.627-2.023 4.212-3.716c-2.423-1.722-11.014-.182-17.012-3.551c2.304-.478 3.382-.943 4.459-2.643c-5.666-1.807-11.77-3.365-15.36-6.359c1.937.024 3.746.434 6.276-1.321c-5.075-2.735-10.491-4.903-14.699-9.084c2.624-.064 5.453-.026 6.276-.991c-4.645-2.878-8.565-6.078-11.809-9.579c3.672.443 5.223.062 6.111-.578c-3.512-3.597-7.956-6.634-10.075-11.066c2.726.94 5.221 1.3 7.019-.082c-1.193-2.692-6.305-4.28-9.249-10.571c2.871.279 5.915.626 6.524 0c-1.332-5.428-3.618-8.48-5.86-11.642c6.143-.091 15.451.024 15.03-.495L31.89 15.39c6.001-1.616 12.141.259 16.599 1.651c2.001-1.579-.036-3.576-2.478-5.615c5.1.681 9.708 1.853 13.874 3.468c2.225-2.009-1.445-4.019-3.221-6.028c7.879 1.494 11.217 3.595 14.534 5.698c2.407-2.307.138-4.268-1.486-6.276c5.941 2.2 9.001 5.041 12.222 7.845c1.092-1.474 2.775-2.555.743-6.111c4.218 2.431 7.395 5.296 9.745 8.506c2.61-1.662 1.555-3.934 1.569-6.029c4.384 3.566 7.166 7.361 10.571 11.066c.686-.5 1.286-2.193 1.817-4.872c10.457 10.145 25.234 35.7 3.798 45.832c-18.243-15.046-40.031-25.983-64.176-34.187zm164.678 0c-31.032 16.003-49.075 28.943-58.959 39.969c5.062 20.289 31.469 21.215 41.125 20.646c-1.977-.92-3.627-2.023-4.211-3.716c2.423-1.722 11.014-.182 17.011-3.551c-2.304-.478-3.381-.943-4.459-2.643c5.667-1.807 11.771-3.365 15.36-6.359c-1.937.024-3.746.434-6.276-1.321c5.076-2.735 10.492-4.903 14.7-9.084c-2.625-.064-5.454-.026-6.276-.991c4.645-2.878 8.565-6.078 11.809-9.579c-3.673.443-5.223.062-6.111-.578c3.511-3.597 7.956-6.634 10.075-11.066c-2.727.94-5.222 1.3-7.02-.082c1.193-2.692 6.306-4.28 9.249-10.571c-2.87.279-5.915.626-6.524 0c1.335-5.43 3.621-8.482 5.863-11.644c-6.143-.091-15.451.024-15.03-.495l3.799-3.882c-6.001-1.615-12.141.26-16.599 1.652c-2.001-1.579.035-3.576 2.477-5.615c-5.099.68-9.708 1.853-13.873 3.468c-2.226-2.009 1.445-4.019 3.221-6.028c-7.879 1.494-11.217 3.595-14.535 5.698c-2.407-2.307-.137-4.268 1.487-6.276c-5.941 2.2-9.001 5.041-12.222 7.845c-1.093-1.474-2.775-2.555-.744-6.111c-4.217 2.431-7.394 5.296-9.744 8.506c-2.61-1.662-1.555-3.935-1.569-6.029c-4.384 3.566-7.166 7.36-10.571 11.066c-.686-.5-1.286-2.193-1.817-4.873c-10.457 10.146-25.234 35.701-3.798 45.833c18.233-15.05 40.02-25.985 64.166-34.189z"/><path fill="#BC1142" d="M165.933 236.933c.108 18.933-16.449 34.362-36.98 34.461c-20.532.1-37.264-15.167-37.372-34.1a21.72 21.72 0 0 1 0-.361c-.108-18.932 16.448-34.361 36.98-34.461c20.532-.1 37.263 15.167 37.372 34.1zm-58.687-97.929c15.404 10.093 18.181 32.969 6.202 51.095c-11.979 18.127-34.177 24.641-49.581 14.549c-15.404-10.093-18.18-32.969-6.202-51.095c11.979-18.127 34.177-24.641 49.581-14.549m41.576-1.827c-15.403 10.092-18.18 32.969-6.202 51.095c11.979 18.127 34.177 24.641 49.581 14.548c15.404-10.092 18.181-32.968 6.202-51.095c-11.978-18.126-34.176-24.64-49.581-14.548M30.258 155.504c16.631-4.458 5.615 68.803-7.917 62.792c-14.885-11.972-19.679-47.033 7.917-62.792m192.195-.913c-16.633-4.457-5.615 68.807 7.917 62.796c14.885-11.973 19.679-47.038-7.917-62.796m-56.507-54.557c28.701-4.846 52.583 12.206 51.619 43.328c-.944 11.932-62.193-41.551-51.619-43.328m-79.3-.913c-28.703-4.847-52.583 12.209-51.619 43.329c.944 11.931 62.194-41.552 51.619-43.329m41.228-7.258c-17.13-.446-33.57 12.713-33.61 20.346c-.047 9.274 13.544 18.77 33.727 19.011c20.61.147 33.762-7.601 33.828-17.172c.076-10.844-18.745-22.353-33.945-22.186zm1.046 190.18c14.935-.652 34.975 4.81 35.015 12.057c.248 7.036-18.175 22.934-36.005 22.627c-18.466.797-36.573-15.126-36.336-20.645c-.277-8.092 22.484-14.41 37.326-14.039m-55.164-42.945c10.633 12.81 15.481 35.316 6.607 41.951c-8.395 5.065-28.782 2.979-43.272-17.838c-9.773-17.468-8.514-35.243-1.652-40.465c10.261-6.25 26.115 2.193 38.318 16.352zm108.2-4.061c-11.505 13.475-17.911 38.053-9.519 45.969c8.025 6.15 29.567 5.29 45.479-16.789c11.554-14.829 7.683-39.594 1.083-46.17c-9.804-7.583-23.879 2.122-37.043 16.986z"/></svg>`,
));

fs.writeFileSync("app/plugins/redis.js", createPlugin(
    "Redis",
    "Everyone need a Redis sometimes.",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 220"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path fill="#912626" d="M245.97 168.943c-13.662 7.121-84.434 36.22-99.501 44.075c-15.067 7.856-23.437 7.78-35.34 2.09c-11.902-5.69-87.216-36.112-100.783-42.597C3.566 169.271 0 166.535 0 163.951v-25.876s98.05-21.345 113.879-27.024c15.828-5.679 21.32-5.884 34.79-.95c13.472 4.936 94.018 19.468 107.331 24.344l-.006 25.51c.002 2.558-3.07 5.364-10.024 8.988"/><path fill="#C6302B" d="M245.965 143.22c-13.661 7.118-84.431 36.218-99.498 44.072c-15.066 7.857-23.436 7.78-35.338 2.09c-11.903-5.686-87.214-36.113-100.78-42.594c-13.566-6.485-13.85-10.948-.524-16.166c13.326-5.22 88.224-34.605 104.055-40.284c15.828-5.677 21.319-5.884 34.789-.948c13.471 4.934 83.819 32.935 97.13 37.81c13.316 4.881 13.827 8.9.166 16.02"/><path fill="#912626" d="M245.97 127.074c-13.662 7.122-84.434 36.22-99.501 44.078c-15.067 7.853-23.437 7.777-35.34 2.087c-11.903-5.687-87.216-36.112-100.783-42.597C3.566 127.402 0 124.67 0 122.085V96.206s98.05-21.344 113.879-27.023c15.828-5.679 21.32-5.885 34.79-.95C162.142 73.168 242.688 87.697 256 92.574l-.006 25.513c.002 2.557-3.07 5.363-10.024 8.987"/><path fill="#C6302B" d="M245.965 101.351c-13.661 7.12-84.431 36.218-99.498 44.075c-15.066 7.854-23.436 7.777-35.338 2.087c-11.903-5.686-87.214-36.112-100.78-42.594c-13.566-6.483-13.85-10.947-.524-16.167C23.151 83.535 98.05 54.148 113.88 48.47c15.828-5.678 21.319-5.884 34.789-.949c13.471 4.934 83.819 32.933 97.13 37.81c13.316 4.88 13.827 8.9.166 16.02"/><path fill="#912626" d="M245.97 83.653c-13.662 7.12-84.434 36.22-99.501 44.078c-15.067 7.854-23.437 7.777-35.34 2.087c-11.903-5.687-87.216-36.113-100.783-42.595C3.566 83.98 0 81.247 0 78.665v-25.88s98.05-21.343 113.879-27.021c15.828-5.68 21.32-5.884 34.79-.95C162.142 29.749 242.688 44.278 256 49.155l-.006 25.512c.002 2.555-3.07 5.361-10.024 8.986"/><path fill="#C6302B" d="M245.965 57.93c-13.661 7.12-84.431 36.22-99.498 44.074c-15.066 7.854-23.436 7.777-35.338 2.09C99.227 98.404 23.915 67.98 10.35 61.497C-3.217 55.015-3.5 50.55 9.825 45.331C23.151 40.113 98.05 10.73 113.88 5.05c15.828-5.679 21.319-5.883 34.789-.948c13.471 4.935 83.819 32.934 97.13 37.811c13.316 4.876 13.827 8.897.166 16.017"/><path fill="#FFF" d="m159.283 32.757l-22.01 2.285l-4.927 11.856l-7.958-13.23l-25.415-2.284l18.964-6.839l-5.69-10.498l17.755 6.944l16.738-5.48l-4.524 10.855zm-28.251 57.518L89.955 73.238l58.86-9.035zm-56.95-50.928c17.375 0 31.46 5.46 31.46 12.194c0 6.736-14.085 12.195-31.46 12.195s-31.46-5.46-31.46-12.195c0-6.734 14.085-12.194 31.46-12.194"/><path fill="#621B1C" d="m185.295 35.998l34.836 13.766l-34.806 13.753z"/><path fill="#9A2928" d="m146.755 51.243l38.54-15.245l.03 27.519l-3.779 1.478z"/></svg>`,
));

fs.writeFileSync("app/plugins/pynode.js", createPlugin(
    "PyNode",
    "When you miss the Python packages.",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 226"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path fill="#F7F7F4" d="m37.232 86.773l36.106 13.141l36.64-13.336l-36.106-13.141z"/><path fill="#CCC" d="M74.203 72.527h-.662l-36.64 13.336v1.82l36.106 13.141h.662l36.64-13.336v-1.82zm-.332 1.938l33.273 12.111l-33.807 12.308L40.064 86.77z"/><path fill="#EFEEEA" d="m37.232 86.773l36.106 13.141v42.436l-36.106-13.141z"/><path fill="#CCC" d="m37.563 85.863l-1.3.91v42.436l.638.91l36.106 13.141l1.3-.91V99.914l-.638-.91zm.634 2.29l34.172 12.435v40.38l-34.172-12.44z"/><path fill="#F7F7F4" d="m73.495 57.103l36.106 13.141l36.64-13.336l-36.105-13.141z"/><path fill="#CCC" d="M110.467 42.857h-.663l-36.64 13.336v1.82l36.106 13.141h.662l36.64-13.336v-1.82zm-.333 1.937l33.273 12.111l-33.811 12.309l-33.277-12.111z"/><path fill="#EFEEEA" d="m73.495 57.103l36.106 13.141v42.436L73.495 99.539z"/><path fill="#CCC" d="m73.827 56.193l-1.3.91v42.436l.637.91l36.106 13.141l1.3-.91V70.244l-.638-.91zm.633 2.289l34.171 12.44v40.375l-34.17-12.436z"/><path fill="#F7F7F4" d="m.968 142.816l36.106 13.142l36.64-13.336l-36.106-13.142z"/><path fill="#CCC" d="M37.94 128.57h-.663L.637 141.908v1.82l36.106 13.14h.662l36.64-13.335v-1.82zm-.331 1.937l33.276 12.11l-33.815 12.31l-33.272-12.112z"/><path fill="#EFEEEA" d="m.968 142.816l36.106 13.142v42.436L.968 185.252z"/><path fill="#CCC" d="m1.3 141.907l-1.3.91v42.435l.637.91l36.106 13.142l1.3-.91v-42.436l-.638-.91zm.635 2.291l34.167 12.436v40.376L1.935 184.574z"/><path fill="#EFEEEA" d="m37.232 156.003l36.106 13.142v42.436l-36.106-13.142z"/><path fill="#CCC" d="m37.563 155.093l-1.3.91v42.436l.638.91l36.106 13.141l1.299-.91v-42.435l-.637-.91zm.634 2.289l34.172 12.44v40.375l-34.172-12.436z"/><path fill="#F7F7F4" d="m37.232 113.146l36.106 13.142l36.64-13.336L73.872 99.81z"/><path fill="#CCC" d="M74.203 98.9h-.662L36.9 112.236v1.82l36.106 13.142h.662l36.64-13.336v-1.82zm-.332 1.94l33.273 12.11l-33.807 12.305l-33.273-12.11z"/><path fill="#EFEEEA" d="m37.232 113.146l36.106 13.142v42.436l-36.106-13.142z"/><path fill="#CCC" d="m37.563 112.236l-1.3.91v42.436l.638.91l36.106 13.142l1.299-.91v-42.436l-.637-.91zm.634 2.291l34.172 12.436v40.376l-34.172-12.436z"/><path fill="#FFF" d="M218.392 142.771v42.436l36.64-13.336v-42.436z"/><path fill="#CCC" d="m254.7 128.525l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91v-42.436zm-.639 2.292v40.376l-34.702 12.63v-40.376z"/><path fill="#FFD242" d="M182.128 155.958v42.436l36.64-13.336v-42.436z"/><path fill="#CCC" d="m218.437 141.712l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91v-42.436zm-.639 2.288v40.38l-34.705 12.63v-40.376z"/><path fill="#FFD242" d="M145.865 169.145v42.436l36.64-13.336v-42.436z"/><path fill="#CCC" d="m182.174 154.899l-36.64 13.336l-.637.91v42.436l1.299.91l36.64-13.336l.637-.91v-42.436zm-.638 2.289v40.376l-34.706 12.633v-40.375z"/><path fill="#FFF" d="M109.601 182.331v42.436l36.64-13.336v-42.436z"/><path fill="#CCC" d="m145.91 168.085l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91v-42.436zm-.64 2.29v40.376l-34.702 12.634v-40.38z"/><path fill="#EFEEEA" d="m73.495 169.19l36.106 13.141v42.436l-36.106-13.141z"/><path fill="#CCC" d="m73.826 168.28l-1.299.91v42.436l.637.91l36.106 13.141l1.3-.91v-42.436l-.638-.91zm.634 2.289l34.171 12.436v40.38l-34.17-12.44z"/><path fill="#FFD242" d="M218.392 99.914v42.436l36.64-13.336V86.578z"/><path fill="#CCC" d="m254.7 85.668l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91V86.578zm-.639 2.29v40.376l-34.702 12.634v-40.38z"/><path fill="#353564" d="M182.286 43.916v42.436l36.64-13.336V30.58z"/><path fill="#CCC" d="m218.595 29.67l-36.64 13.336l-.638.91v42.436l1.3.91l36.64-13.336l.637-.91V30.58zm-.638 2.29v40.375L183.252 84.97V44.593z"/><path fill="#FFC91D" d="m182.286 43.916l36.106 13.141l36.64-13.336l-36.106-13.141z"/><path fill="#CCC" d="M219.257 29.67h-.662l-36.64 13.336v1.82l36.105 13.141h.663l36.64-13.336v-1.82zm-.331 1.937l33.28 12.11l-33.815 12.31l-33.273-12.112z"/><path fill="#FFD242" d="M218.392 57.057v42.436l36.64-13.335V43.721z"/><path fill="#CCC" d="m254.7 42.812l-36.64 13.336l-.637.91v42.435l1.3.91l36.64-13.336l.637-.91V43.722zm-.639 2.288v40.38L219.36 98.11V57.734z"/><path fill="#FFD242" d="M182.128 113.101v42.436l36.64-13.336V99.765z"/><path fill="#CCC" d="m218.437 98.855l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91V99.765zm-.639 2.291v40.376l-34.705 12.63v-40.376z"/><path fill="#3775A9" d="M182.128 70.244v42.436l36.64-13.336V56.908z"/><path fill="#CCC" d="m218.437 55.998l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91V56.908zm-.639 2.29v40.376l-34.705 12.633V70.922z"/><path fill="#2F6491" d="m146.022 14.246l36.106 13.141l36.64-13.336L182.663.91z"/><path fill="#CCC" d="M182.994 0h-.663l-36.64 13.336v1.82l36.106 13.141h.662l36.64-13.336v-1.82zm-.335 1.936l33.273 12.115l-33.807 12.304l-33.273-12.11z"/><path fill="#3775A9" d="M182.128 27.387v42.436l36.64-13.336V14.051z"/><path fill="#CCC" d="m218.437 13.141l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91V14.051zm-.639 2.293v40.375l-34.705 12.63V28.063z"/><path fill="#AFAFDE" d="m109.759 155.582l36.106 13.142l36.64-13.336l-36.106-13.142z"/><path fill="#CCC" d="M146.73 141.336h-.662l-36.64 13.336v1.82l36.106 13.142h.662l36.64-13.336v-1.82zm-.333 1.94l33.272 12.111l-33.807 12.304l-33.273-12.11z"/><path fill="#FFD242" d="M145.865 126.288v42.436l36.64-13.336v-42.436z"/><path fill="#CCC" d="m182.174 112.042l-36.64 13.336l-.637.91v42.436l1.299.91l36.64-13.336l.637-.91v-42.436zm-.638 2.292v40.375l-34.706 12.63v-40.376z"/><path fill="#3775A9" d="M145.865 83.431v42.436l36.64-13.336V70.095z"/><path fill="#CCC" d="m182.174 69.185l-36.64 13.336l-.637.91v42.436l1.299.91l36.64-13.336l.637-.91V70.095zm-.638 2.29v40.376l-34.706 12.63V84.105z"/><path fill="#E9E9FF" d="m110.135 112.997l36.106 13.141v42.437l-36.106-13.142z"/><path fill="#CCC" d="m110.467 112.087l-1.3.91v42.436l.637.91l36.106 13.141l1.3-.91v-42.436l-.638-.91zm.635 2.29l34.167 12.435v40.38l-34.167-12.44z"/><path fill="#3775A9" d="M109.601 139.474v42.436l36.64-13.335v-42.437z"/><path fill="#CCC" d="m145.91 125.229l-36.64 13.336l-.637.91v42.435l1.3.91l36.64-13.336l.637-.91v-42.436zm-.64 2.288v40.38l-34.702 12.63V140.15z"/><path fill="#2F6491" d="m73.495 126.333l36.106 13.141v42.436l-36.106-13.141z"/><path fill="#CCC" d="m73.826 125.423l-1.299.91v42.436l.637.91l36.106 13.141l1.3-.91v-42.436l-.638-.91zm.634 2.292l34.171 12.436v40.375l-34.17-12.436z"/><path fill="#2F6491" d="m73.495 83.476l36.106 13.142l36.64-13.336l-36.106-13.142z"/><path fill="#CCC" d="M110.467 69.23h-.663l-36.64 13.336v1.82l36.106 13.141h.662l36.64-13.336v-1.82zm-.333 1.94l33.273 12.11l-33.808 12.305l-33.272-12.111z"/><path fill="#3775A9" d="M109.601 96.618v42.436l36.64-13.336V83.282z"/><path fill="#CCC" d="m145.91 82.372l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.336l.637-.91V83.282zm-.64 2.29v40.376l-34.702 12.63V97.293z"/><path fill="#2F6491" d="m73.495 83.476l36.106 13.142v42.436l-36.106-13.142z"/><path fill="#CCC" d="m73.826 82.566l-1.299.91v42.436l.637.91l36.106 13.141l1.3-.91V96.619l-.638-.91zm.634 2.29l34.171 12.437v40.375l-34.17-12.436z"/><path fill="#353564" d="M109.759 27.433v42.436l36.64-13.336V14.097z"/><path fill="#CCC" d="m146.068 13.187l-36.64 13.336l-.637.91v42.436l1.3.91l36.64-13.337l.636-.91V14.098zm-.64 2.29v40.375l-34.701 12.633V28.11z"/><path fill="#2F6491" d="m109.759 27.433l36.106 13.141l36.64-13.336l-36.106-13.141z"/><path fill="#CCC" d="M146.73 13.187h-.662l-36.64 13.336v1.82l36.106 13.14h.662l36.64-13.335v-1.82zm-.33 1.937l33.27 12.11l-33.808 12.309l-33.273-12.111z"/><path fill="#3775A9" d="M145.865 40.574V83.01l36.64-13.336V27.238z"/><path fill="#CCC" d="m182.174 26.328l-36.64 13.336l-.637.91V83.01l1.299.91l36.64-13.336l.637-.91V27.238zm-.638 2.29v40.379l-34.706 12.63V41.25z"/><path fill="#2F6491" d="m109.759 27.433l36.106 13.141V83.01l-36.106-13.141z"/><path fill="#CCC" d="m110.09 26.523l-1.3.91v42.436l.638.91l36.106 13.14l1.299-.909V40.574l-.637-.91zm.636 2.292l34.168 12.436v40.375L110.726 69.19z"/><ellipse cx="205.091" cy="168.866" fill="#FFF" rx="7.037" ry="4.927"/><ellipse cx="159.543" cy="56.765" fill="#FFF" rx="7.037" ry="4.927"/></svg>`,
));

fs.writeFileSync("app/plugins/arch.js", createPlugin(
    "Arch",
    "No questions, please.",
    "developer-tools",
    "",
    `<svg xmlns="http://www.w3.org/2000/svg" width="52px" height="52px" viewBox="0 0 256 256"><!-- Icon from SVG Logos by Gil Barbara - https://raw.githubusercontent.com/gilbarbara/logos/master/LICENSE.txt --><path fill="#1793D1" d="M127.976 0c-11.397 27.936-18.27 46.21-30.959 73.315c7.78 8.245 17.329 17.846 32.837 28.69c-16.673-6.859-28.045-13.746-36.544-20.892C77.07 114.992 51.63 163.25 0 256c40.579-23.422 72.035-37.863 101.35-43.373a74.264 74.264 0 0 1-1.926-17.378l.049-1.3c.644-25.992 14.168-45.98 30.188-44.624c16.02 1.357 28.473 23.542 27.83 49.535c-.122 4.89-.674 9.596-1.638 13.96C184.851 218.49 215.97 232.894 256 256c-7.893-14.529-14.938-27.626-21.666-40.1c-10.598-8.212-21.652-18.9-44.2-30.47c15.498 4.025 26.595 8.67 35.244 13.863C156.973 71.958 151.434 55.038 127.976 0"/></svg>`,
));

return {flag, secrets, fs, path, yauzl, crypto, ejs, process, module}
