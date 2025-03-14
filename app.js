// Fetch and display the CSV file content
document.addEventListener("DOMContentLoaded", () => {
    const csvFilePath = 'Tribute.csv'; // Path to your CSV file
    const table = document.getElementById("tribute-table");

    fetch(csvFilePath)
        .then(response => response.text())
        .then(data => {
            const rows = parseCSV(data);
            const groupedData = groupEntries(rows);
            const sortedData = sortByFirstName(groupedData, 1); // Sort by Column 2 (index 1) using FIRST name
            renderTable(sortedData, table);
            setupAlphabetNavigation(sortedData, table);
        })
        .catch(error => console.error("Error fetching the CSV file:", error));
});

// Parse CSV data into an array of rows
function parseCSV(data) {
    const lines = data.trim().split("\n");
    return lines.map(line => line.split(",").map(cell => cell.trim()));
}

// Group multiple entries for specific columns into comma-separated strings
function groupEntries(rows) {
    const header = rows[0];
    const groupedRows = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        const donorName = row[0] ? row[0].split(";").join(", ") : "";
        const tributeName = row[2] ? row[2].split(";").join(", ") : "";
        const inHonorMemoryOf = row[1] || "";
        const imageURLs = row[3] ? row[3].split(";") : [];

        groupedRows.push([donorName, inHonorMemoryOf, tributeName, imageURLs]);
    }

    return [header, ...groupedRows];
}

// SORT rows by the FIRST name in a specific column
function sortByFirstName(rows, columnIndex) {
    const header = rows[0];
    const body = rows.slice(1);

    const sortedBody = body.sort((a, b) => {
        const firstNameA = getFirstWord(a[columnIndex]);
        const firstNameB = getFirstWord(b[columnIndex]);
        return firstNameA.localeCompare(firstNameB);
    });

    return [header, ...sortedBody];
}

// Helper function to extract the FIRST word (first name) from a string
function getFirstWord(string) {
    if (!string) return "";
    const words = string.split(" "); // Split by space instead of comma
    return words[0].trim();
}

// Render the table on the page
function renderTable(rows, table) {
    table.innerHTML = "";

    const headerRow = document.createElement("tr");
    rows[0].slice(0, 3).forEach(headerText => {
        const headerCell = document.createElement("th");
        headerCell.textContent = headerText === "Image URL" ? "" : headerText;
        headerRow.appendChild(headerCell);
    });

    const imageHeaderCell = document.createElement("th");
    imageHeaderCell.textContent = "";
    headerRow.appendChild(imageHeaderCell);

    table.appendChild(headerRow);

    const alphabetHeaders = {};

    rows.slice(1).forEach(row => {
        const firstName = getFirstWord(row[1]);
        const firstLetter = firstName[0]?.toUpperCase() || "#";

        if (!alphabetHeaders[firstLetter]) {
            const alphabetRow = document.createElement("tr");
            const alphabetCell = document.createElement("th");
            alphabetCell.colSpan = 4;
            alphabetCell.style.textAlign = "center";
            alphabetCell.style.fontWeight = "bold";
            alphabetCell.style.backgroundColor = "#003366";
            alphabetCell.style.color = "#fff";
            alphabetCell.style.fontSize = "1.2em";
            alphabetCell.style.padding = "10px";
            alphabetCell.innerHTML = `<a id="letter-${firstLetter}" href="#letter-${firstLetter}" style="color: white; text-decoration: none;">${firstLetter}</a>`;
            alphabetRow.appendChild(alphabetCell);
            table.appendChild(alphabetRow);

            alphabetHeaders[firstLetter] = true;
        }

        const tableRow = document.createElement("tr");

        row.slice(0, 3).forEach(cellText => {
            const tableCell = document.createElement("td");
            tableCell.textContent = cellText;
            tableRow.appendChild(tableCell);
        });

        const imageCell = document.createElement("td");
        row[3].forEach(url => {
            if (url) {
                const img = document.createElement("img");
                img.src = url;
                img.className = "honoree-image";
                img.alt = "Honoree Image";
                img.style.maxWidth = "100px";
                img.style.margin = "5px";
                img.onerror = function () { this.style.display = "none"; };
                imageCell.appendChild(img);
            }
        });

        tableRow.appendChild(imageCell);
        table.appendChild(tableRow);
    });
}

// Setup alphabetical navigation
function setupAlphabetNavigation(rows, table) {
    const navLinks = document.querySelectorAll("#alphabet-nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const letter = link.dataset.letter;
            const target = document.getElementById(`letter-${letter}`);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}

