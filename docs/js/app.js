document.addEventListener('DOMContentLoaded', () => {
    const rulesContainer = document.getElementById('rules-container');
    const searchBar = document.getElementById('search-bar');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const githubUsername = 'aj-tap';
    const githubRepoName = 'SuperSQLHunt';
    const repoApiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepoName}/contents/_rules`;
    
    let allRules = [];

    async function fetchRules() {
        try {
            const response = await fetch(repoApiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            const files = await response.json();
            
            const ruleFiles = files.filter(file => (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) && file.type === 'file');
            
            if (ruleFiles.length === 0) {
                rulesContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning" role="alert">No <code>.yaml</code> or <code>.yml</code> files were found in the <code>_rules</code> directory.</div></div>';
                return;
            }

            const rulePromises = ruleFiles.map(async (file) => {
                const res = await fetch(file.download_url);
                const textContent = await res.text();
                return jsyaml.load(textContent);
            });

            allRules = await Promise.all(rulePromises);
            renderRules(allRules);
            
        } catch (error) {
            console.error('Failed to fetch rules:', error);
            let errorMessage;
            if (error.message.includes('403')) {
                errorMessage = '<strong>Error 403: Forbidden.</strong> You may have hit the GitHub API rate limit. Please wait a few minutes and try again.';
            } else if (error.message.includes('404')) {
                errorMessage = `<strong>Error 404: Not Found.</strong> The repository or the <code>_rules</code> directory could not be found. Verify the <code>repoApiUrl</code> in <code>js/app.js</code>.`;
            } else {
                errorMessage = `<strong>An unexpected error occurred:</strong> ${error.message}. Check the console (F12) for more details.`;
            }
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
            const tagBadges = tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join(' ');

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
                            <details>
                                <summary>Show Syntax</summary>
                                <pre><code>${rule.syntax || ''}</code></pre>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        const filteredRules = allRules.filter(rule => {
            const titleMatch = (rule.title || '').toLowerCase().includes(query);
            const tags = Array.isArray(rule.tags) ? rule.tags : (rule.tags ? [rule.tags] : []);
            const tagMatch = tags.some(tag => tag.toLowerCase().includes(query));
            return titleMatch || tagMatch;
        });
        
        renderRules(filteredRules);
    });

    fetchRules();
});