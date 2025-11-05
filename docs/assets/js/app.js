document.addEventListener('DOMContentLoaded', () => {
    const rulesContainer = document.getElementById('rules-container');
    const searchBar = document.getElementById('search-bar');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const ruleTemplate = document.getElementById('rule-template');

    if (!ruleTemplate) {
        console.error('Error: The #rule-template element was not found in the DOM.');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        rulesContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger" role="alert"><strong>Developer Error:</strong> The <code>#rule-template</code> was not found. Cannot render rules.</div></div>';
        return;
    }
    
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
            const errorMessage = `<strong>An error occurred while loading rules:</strong> ${error.message}`;
            rulesContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger" role="alert">${errorMessage}</div></div>`;
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    function renderRules(rules) {
        const children = Array.from(rulesContainer.children);
        children.forEach(child => {
            if (child.id !== 'rule-template') {
                rulesContainer.removeChild(child);
            }
        });

        if (rules.length === 0) {
            const noRules = document.createElement('div');
            noRules.className = 'col-12';
            noRules.innerHTML = '<p class="text-center text-muted">No rules found matching your criteria.</p>';
            rulesContainer.appendChild(noRules);
            return;
        }

        rules.forEach(rule => {
            const card = ruleTemplate.cloneNode(true);
            
            card.id = '';
            card.style.display = '';

            card.querySelector('.card-title').textContent = rule.title || 'Untitled Rule';
            card.querySelector('.card-subtitle').textContent = `By: ${rule.author || 'Unknown'}`;
            card.querySelector('.card-text').textContent = rule.description || '';
            card.querySelector('pre code').textContent = rule.syntax || '';

            const tagsContainer = card.querySelector('.rule-tags-container');
            tagsContainer.innerHTML = '';
            
            const tags = Array.isArray(rule.tags) ? rule.tags : (rule.tags ? [rule.tags] : []);
            
            if (tags.length > 0) {
                tags.forEach(tagText => {
                    const tagBadge = document.createElement('span');
                    tagBadge.className = 'badge bg-secondary me-1 tag-badge-clickable';
                    tagBadge.textContent = tagText;
                    tagsContainer.appendChild(tagBadge);
                });
            }

            rulesContainer.appendChild(card);
        });
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
    });

    fetchRules();
});