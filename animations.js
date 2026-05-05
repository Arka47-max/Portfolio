/* ============================================================
   ANIMATIONS.JS — KOSCIUSZKO ENZO
   Gère tous les effets dynamiques du portfolio :
   - Curseur personnalisé
   - Révélation au scroll
   - Parallaxe souris sur le hero
   - Effet spotlight sur les cartes
   - Ticker défilant
   - Compteur animé (score Pix)
   - Barres de compétences animées
   ============================================================ */

/* ============================================================
   1. CURSEUR PERSONNALISÉ
   ============================================================ */
function initCurseur() {
  const point  = document.getElementById('curseur-point');
  const anneau = document.getElementById('curseur-anneau');
  if (!point || !anneau) return;

  let mouseX = 0, mouseY = 0;
  let anneauX = 0, anneauY = 0;

  // Position exacte du point
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    point.style.left = mouseX + 'px';
    point.style.top  = mouseY + 'px';
  });

  // L'anneau suit avec un léger retard (interpolation)
  function animer() {
    // Lerp (linear interpolation) — 0.12 = vitesse de rattrapage
    anneauX += (mouseX - anneauX) * 0.12;
    anneauY += (mouseY - anneauY) * 0.12;
    anneau.style.left = anneauX + 'px';
    anneau.style.top  = anneauY + 'px';
    requestAnimationFrame(animer);
  }
  animer();

  // Agrandissement sur éléments interactifs
  const interactifs = document.querySelectorAll('a, button, .btn, .spotlight-card, .hobby-tag, .certif-lien');
  interactifs.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('curseur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('curseur-hover'));
  });
}

/* ============================================================
   2. RÉVÉLATION AU SCROLL (Intersection Observer)
   Cherche tous les éléments .reveal et .timeline-item
   et leur ajoute .visible quand ils entrent dans la vue.
   ============================================================ */
function initScrollReveal() {
  const options = {
    threshold: 0.12,       // déclenche quand 12% de l'élément est visible
    rootMargin: '0px 0px -40px 0px' // légèrement avant le bas de l'écran
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // On arrête d'observer après la première apparition
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observe tous les éléments reveal
  document.querySelectorAll('.reveal, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================================
   3. BARRES DE COMPÉTENCES ANIMÉES
   Les .comp-barre-rempli ont un attribut data-width="80%".
   Quand elles deviennent visibles, on applique cette largeur.
   ============================================================ */
function initBarresCompetences() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const barre = entry.target;
        // On lit la largeur cible depuis data-width ou style inline original
        const cible = barre.dataset.width || barre.style.width || '0%';
        // Petit délai pour que l'animation soit visible
        setTimeout(() => {
          barre.style.width = cible;
        }, 100);
        observer.unobserve(barre);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.comp-barre-rempli, .certif-module-barre-rempli').forEach(barre => {
    // Sauvegarde la largeur cible en data-width, puis remet à 0
    const largeurCible = barre.style.width;
    if (largeurCible && largeurCible !== '0%') {
      barre.dataset.width = largeurCible;
      barre.style.width = '0%';
    }
    observer.observe(barre);
  });
}

/* ============================================================
   4. COMPTEUR ANIMÉ (score Pix)
   Cherche les éléments .certif-score-valeur avec data-count
   et anime le chiffre de 0 jusqu'à la valeur cible.
   ============================================================ */
function initCompteurs() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const cible = parseInt(el.dataset.count, 10);
        const duree = 1400; // ms
        const debut = performance.now();

        function animer(now) {
          const elapsed = now - debut;
          const progress = Math.min(elapsed / duree, 1);
          // Easing out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * cible);
          if (progress < 1) requestAnimationFrame(animer);
        }

        requestAnimationFrame(animer);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.certif-score-valeur[data-count]').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================================
   5. PARALLAXE SOURIS sur le hero
   La photo se décale légèrement en sens inverse du mouvement
   de la souris — effet de profondeur subtil.
   ============================================================ */
function initParallaxe() {
  const hero = document.querySelector('.hero');
  const inner = document.querySelector('.hero-profil-inner');
  if (!hero || !inner) return;

  document.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    // Position de la souris relative au centre du hero (-0.5 à 0.5)
    const rx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ry = (e.clientY - rect.top)  / rect.height - 0.5;

    // Décalage max : 12px — sens inverse de la souris
    const dx = -rx * 12;
    const dy = -ry * 8;

    inner.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // Réinitialise quand la souris sort du hero
  hero.addEventListener('mouseleave', () => {
    inner.style.transform = 'translate(0px, 0px)';
  });
}

/* ============================================================
   6. EFFET SPOTLIGHT sur les cartes
   Suit la position de la souris à l'intérieur de chaque carte
   et injecte les variables CSS --mx et --my pour le halo.
   ============================================================ */
function initSpotlight() {
  document.querySelectorAll('.spotlight-card').forEach(carte => {
    carte.addEventListener('mousemove', (e) => {
      const rect = carte.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      carte.style.setProperty('--mx', x + 'px');
      carte.style.setProperty('--my', y + 'px');
    });
  });
}

/* ============================================================
   7. TICKER — construction du contenu défilant
   On duplique les items pour créer la boucle infinie.
   ============================================================ */
function initTicker() {
  const piste = document.querySelector('.ticker-piste');
  if (!piste) return;

  // Les items à afficher — modifie cette liste librement
  const items = [
    'HTML / CSS', 'C#', 'SQL', 'Cybersécurité', 'BTS SIO',
    'SLAM', 'Développement Web', 'Réseaux', 'Cisco',
    'GitHub', 'ANSSI', 'Pix 515', 'Stage 2026'
  ];

  // Génère le HTML pour un jeu d'items
  function genererItems() {
    return items.map(item => `<span class="ticker-item">${item}</span>`).join('');
  }

  // Deux copies pour la boucle seamless
  piste.innerHTML = genererItems() + genererItems();
}

/* ============================================================
   8. SMOOTH REVEAL des sections complètes
   Applique automatiquement .reveal à tous les éléments
   qui n'en ont pas encore et qui méritent d'être animés.
   ============================================================ */
function appliquerReveal() {
  // Sélecteurs à animer automatiquement
  const selecteurs = [
    '.section-competences',
    '.section-certifications',
    '.section-experiences',
    '.section-langues',
    '.section-hobbies',
    '.certif-carte',
    '.competence-carte',
    '.langue-carte',
    '.hobby-tag',
    '.bornage-carte',
    '.outil-carte',
    '.news-carte',
    '.label',
    '.section-titre',
  ];

  selecteurs.forEach((sel, i) => {
    document.querySelectorAll(sel).forEach((el, j) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        // Délai en cascade : chaque élément attend un peu plus
        el.style.transitionDelay = (j * 0.08) + 's';
      }
    });
  });
}

/* ============================================================
   INIT — Lance tout quand le DOM est prêt
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  appliquerReveal();      // 1. Marque les éléments à animer
  initScrollReveal();     // 2. Active l'observer pour .reveal
  initBarresCompetences();// 3. Anime les barres de compétences
  initCompteurs();        // 4. Anime les compteurs de score
  initParallaxe();        // 5. Parallaxe souris sur le hero
  initSpotlight();        // 6. Halo lumineux sur les cartes
  initTicker();           // 7. Construit le ticker défilant
  initCurseur();          // 8. Curseur personnalisé (en dernier)
});
