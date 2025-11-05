document.addEventListener('DOMContentLoaded', () => {

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const ruleIdInput = document.getElementById('rule-id');
    if (ruleIdInput) {
        ruleIdInput.value = generateUUID();
    }

    const form = document.getElementById('rule-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const id = document.getElementById('rule-id').value;
            const title = document.getElementById('rule-title').value;
            const description = document.getElementById('rule-description').value;
            const author = document.getElementById('rule-author').value;
            const tagsInput = document.getElementById('rule-tags').value;
            const syntax = document.getElementById('rule-syntax').value;
            const source = document.getElementById('rule-source').value;

            const tags = tagsInput.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
                .map(tag => `  - ${tag}`)
                .join('\n');

            const fileContent = `id: ${id}
title: "${title.replace(/"/g, '\\"')}"
description: ${description}
author: ${author}
tags:
${tags}
syntax: |
  ${syntax.replace(/\n/g, '\n  ')}
source: ${source}
`;

            const githubUsername = 'aj-tap';
            const githubRepoName = 'SuperSQLHunt';
            const filename = `_rules/${title.toLowerCase().replace(/[^a-z0-N9]+/g, '-')}.yaml`;

            const baseUrl = `https://github.com/${githubUsername}/${githubRepoName}/new/main`;
            const url = `${baseUrl}?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(fileContent)}`;

            window.open(url, '_blank');
        });
    }
});