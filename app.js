let allSpells = [];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

async function loadSpells() {
  try {
    const response = await fetch('spells.json');
    allSpells = await response.json();
    renderSpells(allSpells);
  } catch (error) {
    console.error('Errore nel caricamento:', error);
  }
}

function renderSpells(spells) {
  const container = document.getElementById('spellsContainer');
  container.innerHTML = '';
  if (spells.length === 0) {
    container.innerHTML = '<p>Nessun incantesimo trovato.</p>';
    return;
  }
  spells.forEach(spell => {
    const card = document.createElement('div');
    card.className = 'spell-card';
    const classesList = spell.classes ? spell.classes.join(', ') : 'N/D';
    const components = [];
    if (spell.components?.verbal) components.push('V');
    if (spell.components?.somatic) components.push('S');
    if (spell.components?.material) components.push('M');

    card.innerHTML = `
      <h2>${spell.name_it} <span class="spell-level">Lvl ${spell.level}</span></h2>
      <div class="spell-meta">
        <p><strong>Scuola:</strong> ${spell.school}</p>
        <p><strong>Classi:</strong> ${classesList}</p>
        <p><strong>Tempo di lancio:</strong> ${spell.casting_time}</p>
        <p><strong>Gittata:</strong> ${spell.range}</p>
        <p><strong>Componenti:</strong> ${components.join(', ') || 'Nessuna'}</p>
        <p><strong>Durata:</strong> ${spell.duration}</p>
      </div>
      <div class="spell-description">
        ${spell.description ? `<p>${spell.description}</p>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function filterSpells() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const selectedLevel = document.getElementById('levelFilter').value;
  const selectedClass = document.getElementById('classFilter').value;

  const filtered = allSpells.filter(spell => {
    const matchesName = spell.name_it.toLowerCase().includes(query) || spell.name.toLowerCase().includes(query);
    const matchesLevel = selectedLevel === '' || spell.level.toString() === selectedLevel;
    const matchesClass = selectedClass === '' || (spell.classes && spell.classes.includes(selectedClass));
    return matchesName && matchesLevel && matchesClass;
  });
  renderSpells(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterSpells);
document.getElementById('levelFilter').addEventListener('change', filterSpells);
document.getElementById('classFilter').addEventListener('change', filterSpells);

loadSpells();