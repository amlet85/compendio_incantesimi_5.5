let allSpells = [];

// Registrazione Service Worker per offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Caricamento del file JSON
async function loadSpells() {
  try {
    const response = await fetch('spells.json');
    allSpells = await response.json();
    renderSpells(allSpells);
  } catch (error) {
    console.error('Errore nel caricamento:', error);
  }
}

// Funzione per estrarre la descrizione dal JSON
function getSpellDescription(spell) {
  // Controlla prima la descrizione in italiano
  if (spell.description_it) {
    return Array.isArray(spell.description_it) 
      ? spell.description_it.join('<br><br>') 
      : spell.description_it;
  }
  // Se non c'è, controlla il campo description generico
  if (spell.description) {
    return Array.isArray(spell.description) 
      ? spell.description.join('<br><br>') 
      : spell.description;
  }
  // Altrimenti controlla la struttura dei dati di sistema
  if (spell.system && spell.system.description && spell.system.description.value) {
    return spell.system.description.value;
  }
  return '<em>Descrizione non disponibile.</em>';
}

// Mostra gli incantesimi a schermo
function renderSpells(spells) {
  const container = document.getElementById('spellsContainer');
  container.innerHTML = '';

  if (spells.length === 0) {
    container.innerHTML = '<p style="text-align:center;">Nessun incantesimo trovato.</p>';
    return;
  }

  spells.forEach(spell => {
    const card = document.createElement('div');
    card.className = 'spell-card';

    const classesList = spell.classes ? spell.classes.join(', ') : (spell.class ? spell.class.join(', ') : 'N/D');
    
    // Gestione componenti (V, S, M)
    const components = [];
    if (spell.components) {
      if (typeof spell.components === 'object') {
        if (spell.components.verbal) components.push('V');
        if (spell.components.somatic) components.push('S');
        if (spell.components.material) components.push('M');
      } else if (typeof spell.components === 'string') {
        components.push(spell.components);
      }
    }

    const descriptionText = getSpellDescription(spell);

    card.innerHTML = `
      <h2>${spell.name_it || spell.name} <span class="spell-level">Lvl ${spell.level ?? 0}</span></h2>
      <div class="spell-meta">
        <p><strong>Scuola:</strong> ${spell.school || 'N/D'}</p>
        <p><strong>Classi:</strong> ${classesList}</p>
        <p><strong>Tempo di lancio:</strong> ${spell.casting_time || 'N/D'}</p>
        <p><strong>Gittata:</strong> ${spell.range || 'N/D'}</p>
        <p><strong>Componenti:</strong> ${components.join(', ') || 'Nessuna'}</p>
        <p><strong>Durata:</strong> ${spell.duration || 'N/D'}</p>
      </div>
      <div class="spell-description">
        ${descriptionText}
      </div>
    `;

    container.appendChild(card);
  });
}

// Filtri di ricerca
function filterSpells() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const selectedLevel = document.getElementById('levelFilter').value;
  const selectedClass = document.getElementById('classFilter').value;

  const filtered = allSpells.filter(spell => {
    const spellNameIt = (spell.name_it || '').toLowerCase();
    const spellNameEn = (spell.name || '').toLowerCase();
    const matchesName = spellNameIt.includes(query) || spellNameEn.includes(query);

    const spellLevel = (spell.level ?? 0).toString();
    const matchesLevel = selectedLevel === '' || spellLevel === selectedLevel;

    const spellClasses = spell.classes || spell.class || [];
    const matchesClass = selectedClass === '' || spellClasses.includes(selectedClass);

    return matchesName && matchesLevel && matchesClass;
  });

  renderSpells(filtered);
}

// Event Listeners per i filtri
document.getElementById('searchInput').addEventListener('input', filterSpells);
document.getElementById('levelFilter').addEventListener('change', filterSpells);
document.getElementById('classFilter').addEventListener('change', filterSpells);

// Avvio
loadSpells();