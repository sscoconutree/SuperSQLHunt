document.addEventListener('DOMContentLoaded', () => {
    const rulesContainer = document.getElementById('rules-container');
    const searchBar = document.getElementById('search-bar');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const rulesJsonUrl = 'rules.json';
    
    let allRules = [];

    async function fetchRules() {
        try {
            const response = await fetch(rulesJsonUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("The <code>rules.json</code> file was not found. It may not have been generated yet.");
                } else {
                    throw new Error(`Error fetching rules: ${response.status} ${response.statusText}`);
                }
            }
            
            allRules = await response.json();
            
            if (!Array.isArray(allRules)) {
                 throw new Error("The <code>rules.json</code> file is not in the correct format (expected an array).");
            }

            if (allRules.length === 0) {
                rulesContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning" role="alert">No rules were found in <code>rules.json</code>.</div></div>';
                return;
            }

            renderRules(allRules);
            
        } catch (error) {
            console.error('Failed to fetch rules:', error);
            const errorMessage = `<strong>An error occurred while loading rules:</strong> ${error.message} Check the console (F12) for more details.`;
            rulesContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger" role="alert">${errorMessage}</div></div>`;
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    function renderRules(rules) {
        if (rules.length === 0) {
            rulesContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">No rules found matching your criteria.</p></div>';
            return;
        }

        rulesContainer.innerHTML = rules.map(rule => {
            const tags = Array.isArray(rule.tags) ? rule.tags : (rule.tags ? [rule.tags] : []);
            const tagBadges = tags.map(tag => `<span class="badge bg-secondary me-1 tag-badge-clickable">${tag}</span>`).join(' ');

            return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${rule.title || 'Untitled Rule'}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">By: ${rule.author || 'Unknown'}</h6>
                        <p class="card-text">${rule.description || ''}</p>
                        <div class="mt-auto">
                            <div class="mb-3">
                                ${tagBadges}
                            </div>
                            <details class="position-relative">
                                <summary>Show Syntax</summary>
                                <button class="btn btn-sm btn-outline-secondary btn-copy-syntax">Copy</button>
                                <pre><code>${rule.syntax || ''}</code></pre>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    function filterAndRender() {
        const query = searchBar.value.toLowerCase();
        
        const filteredRules = allRules.filter(rule => {
            const titleMatch = (rule.title || '').toLowerCase().includes(query);
            const descMatch = (rule.description || '').toLowerCase().includes(query);
            const authorMatch = (rule.author || '').toLowerCase().includes(query);
            const syntaxMatch = (rule.syntax || '').toLowerCase().includes(query);
            const tags = Array.isArray(rule.tags) ? rule.tags : (rule.tags ? [rule.tags] : []);
            const tagMatch = tags.some(tag => tag.toLowerCase().includes(query));
            
            return titleMatch || descMatch || authorMatch || syntaxMatch || tagMatch;
        });
        
        renderRules(filteredRules);
    }

    searchBar.addEventListener('input', filterAndRender);

    rulesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-badge-clickable')) {
            e.preventDefault();
            searchBar.value = e.target.innerText;
            searchBar.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (e.target.classList.contains('btn-copy-syntax')) {
            e.preventDefault();
            const button = e.target;
            const details = button.closest('details');
            const code = details.querySelector('pre code');
            
            if (code) {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    button.innerText = 'Copied!';
                    setTimeout(() => {
                        button.innerText = 'Copy';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        }
    });

    fetchRules();
});