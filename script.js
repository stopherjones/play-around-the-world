let countriesData = [];

fetch("countries.json")
    .then(res => res.json())
    .then(data => {
        countriesData = data;
        renderGallery(data);
        updateStats(data);
    });

function updateStats(data) {
    // Count total books and read countries
    const totalBooks = data.reduce((sum, c) => sum + (c.books ? c.books.length : 0), 0);
    const readCountries = data.filter(c => c.read).length;
    const totalCountries = data.filter(c => c.type === 'country').length;
    
    const statText = document.getElementById("statText");
    if (statText) {
        statText.textContent = `${totalBooks} books read in ${readCountries} of ${totalCountries} countries`;
    }
}

function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    // Mark the gallery as containing sections so the outer container won't layout children in columns
    gallery.classList.add('sectioned');

    // Group by type: countries and territories
    const countries = data.filter(d => d.type === 'country');
    const territories = data.filter(d => d.type === 'territory');

    function renderSection(title, items) {
        if (!items || items.length === 0) return;
        const heading = document.createElement('div');
        heading.classList.add('section-title');
        heading.textContent = title;
        gallery.appendChild(heading);

        const grid = document.createElement('div');
        grid.classList.add('gallery-grid');

        items.forEach(country => {
            const item = document.createElement("div");
            item.classList.add("gallery-item");

            const wrapper = document.createElement("div");
            wrapper.classList.add("flag-wrapper");

            const img = document.createElement("img");
            img.classList.add("gallery-image");

            if (!country.read) img.classList.add("grayscale");

            // Choose image source
            if (country.code.includes("/") || country.code.startsWith("http")) {
                img.src = country.code;
            } else {
                img.src = `https://flagcdn.com/w640/${country.code}.png`;
            }

            img.alt = `Flag of ${country.name}`;
            wrapper.appendChild(img);
            item.appendChild(wrapper);

            const caption = document.createElement("div");
            caption.classList.add("caption");
            caption.textContent = country.name;
            item.appendChild(caption);

            // Popup only for read countries/territories
            if (country.read && country.books && country.books.length > 0) {
                const overlay = document.createElement("div");
                overlay.classList.add("popup-overlay");

                const popup = document.createElement("div");
                popup.classList.add("popup-box");

                const titleEl = document.createElement("h2");
                titleEl.textContent = country.name;
                popup.appendChild(titleEl);

                const list = document.createElement("ul");
                country.books.forEach(book => {
                    const li = document.createElement("li");
                    li.textContent = `${book.title} – ${book.author}`;
                    list.appendChild(li);
                });
                popup.appendChild(list);

                const close = document.createElement("a");
                close.href = "#";
                close.classList.add("close-btn");
                close.textContent = "Close";
                close.addEventListener("click", e => {
                    e.preventDefault();
                    overlay.classList.remove("active");
                });
                popup.appendChild(close);

                overlay.appendChild(popup);
                item.appendChild(overlay);

                wrapper.addEventListener("click", () => {
                    overlay.classList.add("active");
                });
            }

            grid.appendChild(item);
        });

        gallery.appendChild(grid);
    }

    renderSection('Countries', countries);
    renderSection('Other regions and territories', territories);

    // If no sections were rendered (empty), remove the sectioned flag so gallery behaves like before
    if (gallery.querySelectorAll('.section-title').length === 0) {
        gallery.classList.remove('sectioned');
    }
}

/* ----------------- FILTER LOGIC ----------------- */

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("continentFilter").addEventListener("change", applyFilters);

function applyFilters() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const continent = document.getElementById("continentFilter").value;

    const filtered = countriesData.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search);
        const matchContinent = continent === "all" || c.continent === continent;
        return matchSearch && matchContinent;
    });

    renderGallery(filtered);
    updateStats(countriesData);
}
