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
    console.error('Errore nel caricamento del file JSON:', error);
  }
}

// Funzione per estrarre il testo della descrizione
function getSpellDescription(spell) {
  if (spell.description_it) return spell.description_it;
  if (spell.descriptions_it) {
    if (typeof spell.descriptions_it === 'string') return spell.descriptions_it;
    if (typeof spell.descriptions_it === 'object') {
      return Object.values(spell.descriptions_it).join('<br><br>');
    }
  }
  if (spell.description) return spell.description;
  return '<em>Descrizione non disponibile.</em>';
}

// Funzione per mostrare gli incantesimi a schermo
function renderSpells(spells) {
  const container = document.getElementById('spellsContainer');
  container.innerHTML = '';

  if (!spells || spells.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding: 20px;">Nessun incantesimo trovato.</p>';
    return;
  }

  spells.forEach(spell => {
    const card = document.createElement('div');
    card.className = 'spell-card';

    // Lettura delle classi
    let classesList = 'N/D';
    if (spell.class_it) {
      classesList = Array.isArray(spell.class_it) ? spell.class_it.join(', ') : spell.class_it;
    } else if (spell.classes) {
      classesList = Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes;
    }

    // Lettura delle componenti (V, S, M)
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
    const levelText = spell.level === 0 || spell.level === '0' ? 'Trucchetto' : `Lvl ${spell.level}`;

    card.innerHTML = `
      <h2>${spell.name_it || spell.name} <span class="spell-level">${levelText}</span></h2>
      <div class="spell-meta">
        <p><strong>Scuola:</strong> ${spell.school_it || spell.school || 'N/D'}</p>
        <p><strong>Classi:</strong> ${classesList}</p>
        <p><strong>Tempo di lancio:</strong> ${spell.casting_time_it || spell.casting_time || 'N/D'}</p>
        <p><strong>Gittata:</strong> ${spell.range_it || spell.range || 'N/D'}</p>
        <p><strong>Componenti:</strong> ${components.join(', ') || 'Nessuna'}</p>
        <p><strong>Durata:</strong> ${spell.duration_it || spell.duration || 'N/D'}</p>
      </div>
      <div class="spell-description">
        ${descriptionText}
      </div>
    `;

    container.appendChild(card);
  });
}

// Funzione di filtraggio flessibile
function filterSpells() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const selectedLevel = document.getElementById('levelFilter').value;
  const selectedClass = document.getElementById('classFilter').value.toLowerCase().trim();

  const filtered = allSpells.filter(spell => {
    // 1. Filtro Nome
    const nameIt = (spell.name_it || '').toLowerCase();
    const nameEn = (spell.name || '').toLowerCase();
    const matchesName = query === '' || nameIt.includes(query) || nameEn.includes(query);

    // 2. Filtro Livello
    const spellLevel = (spell.level !== undefined && spell.level !== null) ? spell.level.toString() : '';
    const matchesLevel = selectedLevel === '' || spellLevel === selectedLevel;

    // 3. Filtro Classe (ricerca flessibile su class_it e su classes)
    let rawClasses = [];
    if (Array.isArray(spell.class_it)) rawClasses.push(...spell.class_it);
    else if (typeof spell.class_it === 'string') rawClasses.push(spell.class_it);
    
    if (Array.isArray(spell.classes)) rawClasses.push(...spell.classes);
    else if (typeof spell.classes === 'string') rawClasses.push(spell.classes);

    const classesString = rawClasses.join(' ').toLowerCase();
    const matchesClass = selectedClass === '' || classesString.includes(selectedClass);

    return matchesName && matchesLevel && matchesClass;
  });

  renderSpells(filtered);
}

// Collegamento eventi
document.getElementById('searchInput').addEventListener('input', filterSpells);
document.getElementById('levelFilter').addEventListener('change', filterSpells);
document.getElementById('classFilter').addEventListener('change', filterSpells);

// Avvio
loadSpells();