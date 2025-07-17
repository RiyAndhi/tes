
    document.addEventListener("DOMContentLoaded", () => {
        const navMenu = document.querySelector(".nav-menu")
        const hamburgerMenu = document.querySelector(".hamburger-menu")
        const articlesGrid = document.querySelector(".articles-grid")
        const itemsPerPageSelect = document.getElementById("items-per-page")
        const sortBySelect = document.getElementById("sort-by")
        const resultsInfo = document.querySelector(".results-info")
        const paginationContainer = document.querySelector(".pagination")

        let currentPage = 1
        let itemsPerPage = Number.parseInt(itemsPerPageSelect.value)
        let sortBy = sortBySelect.value
        let totalItems = 0
        let totalPages = 1

        const API_BASE_URL = 'https://suitmedia-backend.suitdev.com/api/ideas';

        // Hamburger menu toggle
        hamburgerMenu.addEventListener("click", () => {
            navMenu.classList.toggle("active")
            hamburgerMenu.classList.toggle("open")
        })

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                if (navMenu.classList.contains("active")) {
                    navMenu.classList.remove("active")
                    hamburgerMenu.classList.remove("open")
                }
            })
        })

        async function fetchArticles(page, size, sort) {
            const params = new URLSearchParams();
            params.append('page[number]', page);
            params.append('page[size]', size);
            params.append('sort', sort === 'newest' ? '-published_at' : 'published_at');
            params.append('append[]', 'small_image');
            params.append('append[]', 'medium_image');

            try {
                const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                return data;
            } catch (err) {
                console.error("Error fetching articles:", err);
                return null;
            }
        }

        async function renderArticles() {
            itemsPerPage = Number.parseInt(itemsPerPageSelect.value);
            const sortParam = sortBySelect.value;

            const data = await fetchArticles(currentPage, itemsPerPage, sortParam);

            if (!data || !data.data || data.data.length === 0) {
                articlesGrid.innerHTML = '<p class="no-results">No articles found.</p>';
                resultsInfo.textContent = "Showing 0 results";
                paginationContainer.innerHTML = "";
                return;
            }

            const articles = data.data;
            totalItems = data.meta.total;
            totalPages = data.meta.last_page;

            articlesGrid.innerHTML = "";

            articles.forEach((article) => {
                const articleCard = document.createElement("div");
                articleCard.classList.add("article-card");

                const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });

let rawImage = article.small_image?.[0]?.url || article.medium_image?.[0]?.url;
let imageUrl = (rawImage && rawImage.startsWith('http')) ? rawImage : 'img/fallback.jpg';

articleCard.innerHTML = `
    <img src="${imageUrl}" alt="${article.title}" onerror="this.onerror=null;this.src='img/fallback.jpg';">
    <div class="card-content">
        <span class="card-date">${formattedDate}</span>
        <a href="#" class="card-title">${article.title}</a>
    </div>
`;




                articlesGrid.appendChild(articleCard);
            });

            const start = (currentPage - 1) * itemsPerPage + 1;
            const end = Math.min(currentPage * itemsPerPage, totalItems);
            resultsInfo.textContent = `Showing ${start}–${end} of ${totalItems} results`;

            renderPagination();
        }

        function renderPagination() {
            paginationContainer.innerHTML = "";
            if (totalPages <= 1) return;

            const createButton = (label, page, disabled = false, isActive = false) => {
                const btn = document.createElement("button");
                btn.textContent = label;
                if (disabled) btn.disabled = true;
                if (isActive) btn.classList.add("active");
                btn.addEventListener("click", () => {
                    currentPage = page;
                    renderArticles();
                });
                return btn;
            };

            paginationContainer.appendChild(createButton("First", 1, currentPage === 1));
            paginationContainer.appendChild(createButton("Prev", currentPage - 1, currentPage === 1));

            const range = 2;
            let start = Math.max(1, currentPage - range);
            let end = Math.min(totalPages, currentPage + range);

            if (start > 1) paginationContainer.appendChild(document.createTextNode("..."));

            for (let i = start; i <= end; i++) {
                paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
            }

            if (end < totalPages) paginationContainer.appendChild(document.createTextNode("..."));

            paginationContainer.appendChild(createButton("Next", currentPage + 1, currentPage === totalPages));
            paginationContainer.appendChild(createButton("Last", totalPages, currentPage === totalPages));
        }

        itemsPerPageSelect.addEventListener("change", () => {
            currentPage = 1;
            renderArticles();
        });

        sortBySelect.addEventListener("change", () => {
            currentPage = 1;
            renderArticles();
        });

        renderArticles();
    });
